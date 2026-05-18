<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ingredient;
use App\Models\MenuIngredient;
use App\Models\Menu;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'total_price' => 'required|numeric',
        ]);

        return DB::transaction(function () use ($request) {
            $order = Order::create([
                'total_price' => $request->total_price,
                'payment_method' => $request->payment_method ?? 'cash',
            ]);

            foreach ($request->items as $item) {
                $menu = Menu::find($item['menu_id']);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $item['menu_id'],
                    'quantity' => $item['quantity'],
                    'price_at_time' => $item['price'],
                    'hpp_at_time' => $menu ? $menu->hpp : 0,
                ]);

                $recipes = MenuIngredient::where('menu_id', $item['menu_id'])->get();
                foreach ($recipes as $recipe) {
                    $ingredient = Ingredient::find($recipe->ingredient_id);
                    if ($ingredient) {
                        $totalReduction = $recipe->quantity_needed * $item['quantity'];
                        $ingredient->decrement('current_stock', $totalReduction);
                    }
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil, stok dikurangi.'
            ], 201);
        });
    }

    public function index()
    {
        $orders = Order::with('items.menu')->orderBy('created_at', 'desc')->get();
        return response()->json($orders);
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $order = Order::with('items')->findOrFail($id);

            foreach ($order->items as $item) {
                $recipes = MenuIngredient::where('menu_id', $item->menu_id)->get();
                foreach ($recipes as $recipe) {
                    $ingredient = Ingredient::find($recipe->ingredient_id);
                    if ($ingredient) {
                        $stockToReturn = $recipe->quantity_needed * $item->quantity;
                        $ingredient->increment('current_stock', $stockToReturn);
                    }
                }
            }

            $order->delete();

            return response()->json(['status' => 'success', 'message' => 'Transaksi dibatalkan, stok dikembalikan!']);
        });
    }
}