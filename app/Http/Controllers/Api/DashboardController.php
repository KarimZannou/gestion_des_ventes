<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalSales = Sale::count();
        $totalRevenue = Sale::sum('total_amount');
        $totalProducts = Product::count();
        $totalCustomers = Customer::count();
        $lowStockProducts = Product::with('category')
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock')
            ->get();
        $recentSales = Sale::with(['customer', 'items.product'])
            ->orderByDesc('sold_at')
            ->limit(5)
            ->get();

        $salesByDay = Sale::select(DB::raw('DATE(sold_at) as date'), DB::raw('SUM(total_amount) as total'), DB::raw('COUNT(*) as count'))
            ->where('sold_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'totals' => [
                'sales' => $totalSales,
                'revenue' => $totalRevenue,
                'products' => $totalProducts,
                'customers' => $totalCustomers,
                'low_stock_count' => $lowStockProducts->count(),
            ],
            'low_stock_products' => $lowStockProducts,
            'recent_sales' => $recentSales,
            'sales_by_day' => $salesByDay,
        ]);
    }
}