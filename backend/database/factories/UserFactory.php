<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'CIN' => fake()->unique()->regexify('[A-Z]{2}[0-9]{6}'),
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'date_naissance' => fake()->date('Y-m-d', '2000-01-01'),
            'etat' => fake()->randomElement(['actif', 'inactif']),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'adresse' => fake()->address(),
            'num_tel' => fake()->phoneNumber(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
