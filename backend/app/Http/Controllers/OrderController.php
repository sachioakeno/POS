<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::where('shop_id', auth()->user()->shop_id)->orderBy('id', 'desc')->get();
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'total_price' => 'required|numeric',
            'payment_method' => 'required|string',
            'items' => 'required|array',
        ]);

        $order = Order::create([
            'shop_id' => auth()->user()->shop_id, // Menggunakan shop_id
            'total_price' => $validated['total_price'],
            'payment_method' => $validated['payment_method'],
        ]);

        return response()->json(['status' => 'success', 'data' => $order]);
    }

    public function destroy($id)
    {
        $order = Order::where('shop_id', auth()->user()->shop_id)->findOrFail($id);
        $order->delete();
        return response()->json(['status' => 'success', 'message' => 'Transaksi dibatalkan.']);
    }
}