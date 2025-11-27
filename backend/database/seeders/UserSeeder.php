<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Admin;
use App\Models\Medecins;
use App\Models\Infirmiers;
use App\Models\Magasiniers;
use App\Models\Receptionnistes;
use App\Models\Patient;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{ //ce code et just pour tester les utilisateurs
    public function run()
    {
        // Admin
        $adminUser = User::create([
            'CIN' => 'ADMIN001',
            'nom' => 'Admin',
            'prenom' => 'System',
            'date_naissance' => '1990-01-01',
            'email' => 'admin@medicare.com',
            'password' => Hash::make('password'),
            'adresse' => 'Adresse admin',
            'num_tel' => '0600000000',
            'etat' => 'actif',
        ]);
        Admin::create(['CIN' => 'ADMIN001']);

        // Médecin
        $medecinUser = User::create([
            'CIN' => 'MEDEC001',
            'nom' => 'Docteur',
            'prenom' => 'Test',
            'date_naissance' => '1985-05-15',
            'email' => 'medecin@medicare.com',
            'password' => Hash::make('password'),
            'adresse' => 'Adresse médecin',
            'num_tel' => '0611111111',
            'etat' => 'actif',
        ]);
        Medecins::create([
            'CIN' => 'MEDEC001',
            'annee_travail' => 2010,
            'specialite' => 'Cardiologie',
            'description' => 'Médecin cardiologue'
        ]);

        // Infirmier
        $infirmierUser = User::create([
            'CIN' => 'INFIR001',
            'nom' => 'Infirmier',
            'prenom' => 'Test',
            'date_naissance' => '1992-08-20',
            'email' => 'infirmier@medicare.com',
            'password' => Hash::make('password'),
            'adresse' => 'Adresse infirmier',
            'num_tel' => '0622222222',
            'etat' => 'actif',
        ]);
        Infirmiers::create([
            'CIN' => 'INFIR001',
            'service' => 'Urgences'
        ]);

        // Patient
        $patientUser = User::create([
            'CIN' => 'PATIE001',
            'nom' => 'Patient',
            'prenom' => 'Test',
            'date_naissance' => '1995-03-10',
            'email' => 'patient@medicare.com',
            'password' => Hash::make('password'),
            'adresse' => 'Adresse patient',
            'num_tel' => '0633333333',
            'etat' => 'actif',
        ]);
        Patient::create([
            'CIN' => 'PATIE001',
            'gender' => 'M',
            'poids' => 75.5,
            'height' => 180.0
        ]);
    }
}