<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $fillable = ['user_id' ,'name', 'price', 'hpp', 'category', 'image'];
}
