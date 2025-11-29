<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'CIN' => 'AA123456',
                'nom' => 'Admin',
                'prenom' => 'System',
                'email' => 'admin@clinique.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'etat' => 'actif',
            ],
            [
                'CIN' => 'BB123456',
                'nom' => 'Dupont',
                'prenom' => 'Jean',
                'email' => 'medecin@clinique.com',
                'password' => Hash::make('password123'),
                'role' => 'medecin',
                'etat' => 'actif',
            ],
            [
                'CIN' => 'CC123456',
                'nom' => 'Martin',
                'prenom' => 'Marie',
                'email' => 'infirmier@clinique.com',
                'password' => Hash::make('password123'),
                'role' => 'infirmier',
                'etat' => 'actif',
            ],
            // Ajoutez d'autres utilisateurs...
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}