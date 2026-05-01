<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            // Milk Teas (Prefix M)
            ['name' => 'Original Pearl Milk Tea', 'price' => 35000, 'quantity' => 100, 'image' => 'assets/img/Pearl_milktea.jpg', 'code' => 'M01', 'status' => 'Available'],
            ['name' => 'Watermelon Pearl Milk Tea', 'price' => 35000, 'quantity' => 100, 'image' => 'assets/img/Watermelon-pearl.jpg', 'code' => 'M02', 'status' => 'Available'],
            ['name' => 'Mango Peach Pearl Milk Tea', 'price' => 35000, 'quantity' => 100, 'image' => 'assets/img/Mango.jpg', 'code' => 'M03', 'status' => 'Available'],
            ['name' => 'Blueberry Pearl Milk Tea', 'price' => 35000, 'quantity' => 100, 'image' => 'assets/img/blueberry.jpg', 'code' => 'M04', 'status' => 'Available'],
            ['name' => 'Indi Beetroot Pearl Milk Tea', 'price' => 35000, 'quantity' => 100, 'image' => 'assets/img/beetroot.jpg', 'code' => 'M05', 'status' => 'Available'],
            ['name' => 'Apricotilas Pearl Milk Tea', 'price' => 35000, 'quantity' => 100, 'image' => 'assets/img/aprico.jpg', 'code' => 'M06', 'status' => 'Available'],
            ['name' => 'Matcha Pearl Milk Tea', 'price' => 40000, 'quantity' => 100, 'image' => 'assets/img/matcha.jpg', 'code' => 'M07', 'status' => 'Available'],
            ['name' => 'Green Melon Pearl Milk Tea', 'price' => 40000, 'quantity' => 100, 'image' => 'assets/img/green-melon.jpg', 'code' => 'M08', 'status' => 'Available'],
            ['name' => 'Horlicks Pearl Milk Tea', 'price' => 40000, 'quantity' => 100, 'image' => 'assets/img/holicks.jpg', 'code' => 'M09', 'status' => 'Available'],
            ['name' => 'Chocolate Pearl Milk Tea', 'price' => 40000, 'quantity' => 100, 'image' => 'assets/img/chocolate.jpg', 'code' => 'M10', 'status' => 'Available'],
            ['name' => 'Delight Taro Pearl Milk Tea', 'price' => 40000, 'quantity' => 100, 'image' => 'assets/img/Taro.jpg', 'code' => 'M11', 'status' => 'Available'],
            ['name' => 'Pure Celery Pearl Milk Tea', 'price' => 40000, 'quantity' => 100, 'image' => 'assets/img/selery.jpg', 'code' => 'M12', 'status' => 'Available'],
            ['name' => 'Strawberry Pearl Milk Tea', 'price' => 45000, 'quantity' => 100, 'image' => 'assets/img/straw.jpg', 'code' => 'M13', 'status' => 'Available'],
            ['name' => 'Honeydew Pearl Milk Tea', 'price' => 45000, 'quantity' => 100, 'image' => 'assets/img/honeydew.jpg', 'code' => 'M14', 'status' => 'Available'],
            ['name' => 'Dragon Fruit Pearl Milk Tea', 'price' => 45000, 'quantity' => 100, 'image' => 'assets/img/dragon-fruit.jpg', 'code' => 'M15', 'status' => 'Available'],
            ['name' => 'Burnt Roasted Pearl Milk Tea', 'price' => 45000, 'quantity' => 100, 'image' => 'assets/img/burnt.jpg', 'code' => 'M16', 'status' => 'Available'],
            
            // Cakes (Prefix C)
            ['name' => 'Oreo Cake', 'price' => 120000, 'quantity' => 100, 'image' => 'assets/img/cake6.png', 'code' => 'C01', 'status' => 'Available'],
            ['name' => 'Chocolate Cake', 'price' => 120000, 'quantity' => 100, 'image' => 'assets/img/cake2(1).png', 'code' => 'C02', 'status' => 'Available'],
            ['name' => 'Strawberry Cake', 'price' => 120000, 'quantity' => 100, 'image' => 'assets/img/cake3(1).png', 'code' => 'C03', 'status' => 'Available'],
            ['name' => 'Caramel Cake', 'price' => 120000, 'quantity' => 100, 'image' => 'assets/img/cake7(1).png', 'code' => 'C04', 'status' => 'Available'],
            ['name' => 'Tiramisu Cake', 'price' => 120000, 'quantity' => 100, 'image' => 'assets/img/cake5(1).png', 'code' => 'C05', 'status' => 'Available'],
            ['name' => 'Cheesecake', 'price' => 120000, 'quantity' => 100, 'image' => 'assets/img/cake4(1).png', 'code' => 'C06', 'status' => 'Available'],
            ['name' => 'Macarons', 'price' => 180000, 'quantity' => 100, 'image' => 'assets/img/cake8(1).png', 'code' => 'C07', 'status' => 'Available'],
            ['name' => 'Yam Cupcake', 'price' => 150000, 'quantity' => 100, 'image' => 'assets/img/yam.jpg', 'code' => 'C08', 'status' => 'Available'],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
