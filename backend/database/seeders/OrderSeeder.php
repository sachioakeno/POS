<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Menu;
use App\Models\Setting;

class OrderSeeder extends Seeder
{
    public function run()
    {
        $menus = Menu::all();
        
        if ($menus->isEmpty()) {
            return;
        }

        $setting = Setting::first();
        $taxRate = $setting ? ($setting->tax_percentage / 100) : 0; 
        $paymentMethods = ['Cash', 'QRIS', 'Card'];

        $kopiSusu = $menus->where('name', 'Iced Kopi Susu Aren')->first();
        $croissant = $menus->where('name', 'Butter Croissant')->first();

        for ($i = 0; $i < 40; $i++) {
            $date = Carbon::now()->subDays(rand(0, 6))->subMinutes(rand(10, 1000));
            $subtotal = 0;
            $itemsToInsert = [];

            if ($kopiSusu && $croissant && rand(1, 100) <= 60) {
                $selectedMenus = collect([$kopiSusu, $croissant]);
                if (rand(1, 100) <= 30) {
                    $selectedMenus->push($menus->except([$kopiSusu->id, $croissant->id])->random());
                }
            } else {
                $selectedMenus = $menus->random(rand(1, 3));
            }

            foreach ($selectedMenus as $menu) {
                $qty = rand(1, 2);
                $subtotal += ($menu->price * $qty);

                $itemsToInsert[] = [
                    'menu_id' => $menu->id,
                    'quantity' => $qty,
                    'price_at_time' => $menu->price,
                    'hpp_at_time' => $menu->hpp
                ];
            }

            $tax = $subtotal * $taxRate;
            $totalPrice = $subtotal + $tax;

            // Mengisi data secara manual (Bypass proteksi mass-assignment $fillable)
            $order = new Order();
            $order->total_price = $totalPrice;
            $order->payment_method = $paymentMethods[array_rand($paymentMethods)];
            $order->created_at = $date;
            $order->updated_at = $date;
            $order->save();

            foreach ($itemsToInsert as $item) {
                $orderItem = new OrderItem();
                $orderItem->order_id = $order->id;
                $orderItem->menu_id = $item['menu_id'];
                $orderItem->quantity = $item['quantity'];
                $orderItem->price_at_time = $item['price_at_time'];
                $orderItem->hpp_at_time = $item['hpp_at_time'];
                $orderItem->created_at = $date;
                $orderItem->updated_at = $date;
                $orderItem->save();
            }
        }
    }
}