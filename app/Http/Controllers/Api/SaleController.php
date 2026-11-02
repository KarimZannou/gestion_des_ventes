<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['customer', 'items.product']);
        if ($search = $request->query('search')) {
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }
        if ($from = $request->query('from')) {
            $query->whereDate('sold_at', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $query->whereDate('sold_at', '<=', $to);
        }
        return $query->orderByDesc('sold_at')->paginate($request->query('per_page', 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $total = 0;
            $sale = Sale::create([
                'customer_id' => $validated['customer_id'] ?? null,
                'total_amount' => 0,
                'status' => 'completed',
                'sold_at' => now(),
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'items' => ["Stock insuffisant pour le produit {$product->name} (disponible: {$product->stock})."],
                    ]);
                }

                $unitPrice = $product->price;
                $subtotal = $unitPrice * $item['quantity'];
                $total += $subtotal;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);

                $product->decrement('stock', $item['quantity']);
            }

            $sale->update(['total_amount' => $total]);

            return response()->json($sale->load(['customer', 'items.product']), 201);
        });
    }

    public function show(Sale $sale)
    {
        return $sale->load(['customer', 'items.product']);
    }

    public function destroy(Sale $sale)
    {
        DB::transaction(function () use ($sale) {
            foreach ($sale->items as $item) {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }
            $sale->delete();
        });
        return response()->noContent();
    }
}