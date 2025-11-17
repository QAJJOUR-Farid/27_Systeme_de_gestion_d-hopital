<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;


class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::create([

            'CIN' => 'AB123456',
            'nom' => 'Doe',
            'prenom' => 'John',
            'date_naissance' => '1990-01-01',
            'etat' => 'actif',
            'email' => 'john.doe@example.com',
            'password' => Hash::make('password123'),
            'adresse' => 'Rue de la Paix, Casablanca',
            'num_tel' => '0612345678',
        ]);
    }
}
