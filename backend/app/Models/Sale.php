<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = ['transaction_date', 'menu_name', 'quantity_sold'];
}