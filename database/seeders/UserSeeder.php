<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'مدير النظام',
                'email' => 'admin@transport.sa',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '0500000001',
            ],
            [
                'name' => 'موظف الحجز',
                'email' => 'agent@transport.sa',
                'password' => Hash::make('password'),
                'role' => 'agent',
                'phone' => '0500000002',
            ],
            [
                'name' => 'أحمد المسافر',
                'email' => 'passenger@transport.sa',
                'password' => Hash::make('password'),
                'role' => 'passenger',
                'phone' => '0500000003',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                $user
            );
        }
    }
}
