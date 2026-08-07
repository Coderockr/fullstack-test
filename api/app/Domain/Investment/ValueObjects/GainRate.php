<?php

declare(strict_types=1);

namespace App\Domain\Investment\ValueObjects;

use Brick\Math\BigDecimal;
use InvalidArgumentException;

/**
 * The monthly compound gain rate (e.g. 0.52% => "0.0052"), stored as an exact
 * decimal so it can drive brick/money arithmetic without floating-point drift.
 */
final class GainRate
{
    private function __construct(private readonly BigDecimal $monthly) {}

    public static function ofMonthly(string $rate): self
    {
        $decimal = BigDecimal::of($rate);

        if ($decimal->isNegative()) {
            throw new InvalidArgumentException('Gain rate cannot be negative.');
        }

        return new self($decimal);
    }

    public function monthly(): BigDecimal
    {
        return $this->monthly;
    }

    /**
     * The per-month multiplier applied to a balance, i.e. (1 + rate).
     */
    public function factor(): BigDecimal
    {
        return BigDecimal::one()->plus($this->monthly);
    }
}
