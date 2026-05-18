<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // 1. Akun Admin / Manajer
        User::create([
            'name' => 'Budi Manager',
            'email' => 'admin@restock.com',
            'password' => Hash::make('rahasia123'),
            'role' => 'admin'
        ]);

        // 2. Akun Kasir
        User::create([
            'name' => 'Siti Kasir',
            'email' => 'kasir@restock.com',
            'password' => Hash::make('kasir123'),
            'role' => 'cashier'
        ]);
    }
}