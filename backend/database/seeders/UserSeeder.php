<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::create([
            'username' => 'admin',
            'name' => 'System Administrator',
            'email' => 'admin@foodsystem.com',
            'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
            'role' => 3, // Admin
        ]);

        \App\Models\User::create([
            'username' => 'staff1',
            'name' => 'Kitchen Staff 01',
            'email' => 'staff1@foodsystem.com',
            'password' => \Illuminate\Support\Facades\Hash::make('staff123'),
            'role' => 2, // Staff
        ]);

        \App\Models\User::create([
            'username' => 'customer1',
            'name' => 'Hoang Lan',
            'email' => 'customer1@gmail.com',
            'password' => \Illuminate\Support\Facades\Hash::make('user123'),
            'role' => 1, // Customer
        ]);
    }
}
