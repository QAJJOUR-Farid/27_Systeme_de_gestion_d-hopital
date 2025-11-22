<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Receptionnistes extends Model
{
    protected $primaryKey = 'id_rec';
    protected $fillable = [
        'CIN'
    ];
    

    public function user()
    {
        return $this->belongsTo(User::class, 'CIN', 'CIN');
    }
}

