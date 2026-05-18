<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Menu;
use App\Models\Ingredient;
use App\Models\Setting;
use App\Models\Order;
use App\Models\OrderItem;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. Akun Hak Akses
        User::create(['name' => 'Budi Manager', 'email' => 'admin@restock.com', 'password' => Hash::make('rahasia123'), 'role' => 'admin']);
        User::create(['name' => 'Siti Kasir', 'email' => 'kasir@restock.com', 'password' => Hash::make('kasir123'), 'role' => 'cashier']);

        // 2. Pengaturan Toko
        $setting = Setting::create(['store_name' => 'Toko', 'tax_percentage' => 10]);

        // 3. Menu
        $menus = [
            Menu::create(['name' => 'Iced Kopi Susu Aren', 'category' => 'Coffee', 'hpp' => 8000, 'price' => 25000, 'image' => 'https://images.unsplash.com/photo-1517701550927-30cfcb64d55b?q=80&w=600&auto=format&fit=crop']),
            Menu::create(['name' => 'Matcha Oat Latte', 'category' => 'Non-Coffee', 'hpp' => 12000, 'price' => 32000, 'image' => 'https://images.unsplash.com/photo-1537289151551-789a74281358?q=80&w=600&auto=format&fit=crop']),
            Menu::create(['name' => 'Butter Croissant', 'category' => 'Pastry', 'hpp' => 10000, 'price' => 22000, 'image' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop']),
        ];

        // 4. Bahan Baku
        Ingredient::create(['name' => 'Biji Kopi Arabica', 'unit' => 'gram', 'current_stock' => 5000]);
        Ingredient::create(['name' => 'Susu Fresh Milk', 'unit' => 'ml', 'current_stock' => 10000]);

        // 5. PAKSA BUAT 40 TRANSAKSI DUMMY 1 MINGGU
        $taxRate = $setting->tax_percentage / 100;
        $paymentMethods = ['Cash', 'QRIS', 'Card'];

        for ($i = 0; $i < 40; $i++) {
            $date = Carbon::now()->subDays(rand(0, 6))->subMinutes(rand(10, 1000));
            
            // Buat Induk Order dulu
            $order = new Order();
            $order->total_price = 0; 
            $order->payment_method = $paymentMethods[array_rand($paymentMethods)];
            $order->created_at = $date;
            $order->updated_at = $date;
            $order->save();

            $subtotal = 0;
            // Pilih 1-2 menu acak
            $selectedMenus = collect($menus)->random(rand(1, 2));
            
            foreach ($selectedMenus as $menu) {
                $qty = rand(1, 2);
                $subtotal += ($menu->price * $qty);

                // Buat Anak Order (Items)
                $orderItem = new OrderItem();
                $orderItem->order_id = $order->id;
                $orderItem->menu_id = $menu->id;
                $orderItem->quantity = $qty;
                $orderItem->price_at_time = $menu->price;
                $orderItem->hpp_at_time = $menu->hpp;
                $orderItem->created_at = $date;
                $orderItem->updated_at = $date;
                $orderItem->save();
            }

            // Update Total Harga setelah Pajak
            $order->total_price = $subtotal + ($subtotal * $taxRate);
            $order->save();
        }
    }
}