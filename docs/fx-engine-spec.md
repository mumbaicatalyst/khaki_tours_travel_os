# Dynamic International Forex & Margin Simulator Engine Specification
## Khaki Travel Operating System (`khaki-travel-os`)

### 1. Executive Problem Statement
International expeditions (₹1,50,000 – ₹3,00,000+/pax) carry substantial overseas supplier commitments payable in foreign currencies (primarily USD). Long sales cycles (60 to 180 days prior to departure) expose Khaki Tours to currency depreciation risk ($USD \uparrow / INR \downarrow$). If USD appreciates by 5-8% between guest booking and DMC wire transfer, gross margins are completely eroded.

The **Dynamic Forex & Margin Simulator Engine** provides algorithmic price locking, volatility buffers, and automated final balance adjustments 30 days prior to departure.

---

## 2. Mathematical Formulation

### Core Variables

| Symbol | Parameter | Unit | Definition |
| :--- | :--- | :--- | :--- |
| $R_{\text{spot}}$ | Spot Exchange Rate | INR / USD | Current interbank exchange rate retrieved via live Forex feed. |
| $B_{\text{volatility}}$ | Volatility Buffer | Percentage (%) | Risk buffer mitigating fluctuation during the quote validity window (Default: 3.00% to 5.00%). |
| $R_{\text{control}}$ | Control Exchange Rate | INR / USD | Effective rate used for internal baseline costing. |
| $C_{\text{USD}}$ | DMC / Overseas Cost | USD | Direct land package, flight, and DMC costs per passenger in USD. |
| $\text{Cost}_{\text{INR}}$ | Cost Floor in INR | INR | Minimum protected cost of goods sold in Indian Rupees. |
| $M_{\text{target}}$ | Target Gross Margin | Percentage (%) | Desired gross profit margin percentage (Default: 22.00%). |
| $P_{\text{INR}}$ | Quoted Selling Price | INR | Final selling price quoted to the client. |
| $R_{\text{settlement}}$ | Settlement Spot Rate | INR / USD | Live exchange rate captured at $T - 30\text{ days}$ before departure. |

---

### Governing Equations

#### 1. Control Exchange Rate
$$R_{\text{control}} = R_{\text{spot}} \times \left(1 + \frac{B_{\text{volatility}}}{100}\right)$$

#### 2. Cost Floor in INR
$$\text{Cost}_{\text{INR}} = C_{\text{USD}} \times R_{\text{control}}$$

#### 3. Quoted Customer Price in INR
$$P_{\text{INR}} = \frac{\text{Cost}_{\text{INR}}}{1 - \left(\frac{M_{\text{target}}}{100}\right)}$$

#### 4. Absolute Gross Margin in INR
$$\text{Margin}_{\text{INR}} = P_{\text{INR}} - \text{Cost}_{\text{INR}}$$

---

## 3. Milestone Payment Schedule & Settlement Rule

International expeditions are structured across three payment tranches:

```
[Booking Date (T - 120d)]
  ├── Tranche 1: Deposit (25% of P_INR)
  │     - Locked at Initial Quoted Price
  │
[Visa Approval (T - 60d)]
  ├── Tranche 2: Milestone 1 (35% of P_INR)
  │     - Fixed at Initial Quoted Price
  │
[Final Settlement (T - 30d)]
  └── Tranche 3: Final Balance (40% of P_INR Adjusted)
        - Locked to Spot Exchange Rate R_settlement
```

### 30-Day Settlement Formula

At $T - 30\text{ days}$, remaining USD commitments ($C_{\text{USD, remaining}} = 0.40 \times C_{\text{USD}}$) are recalculated:

$$\Delta R = R_{\text{settlement}} - R_{\text{control}}$$

1. **If $\Delta R \le 0$ (INR has strengthened or remained within buffer):**
   - Client receives the originally contracted final payment amount:
   $$\text{Final Tranche}_{\text{INR}} = 0.40 \times P_{\text{INR}}$$
   - Any excess buffer gained enhances Khaki Tours realized margin.

2. **If $\Delta R > 0$ (USD has breached the volatility buffer):**
   - The adjustment clause triggers only on the net variance beyond $B_{\text{volatility}}$:
   $$\text{Surcharge}_{\text{INR}} = C_{\text{USD, remaining}} \times (R_{\text{settlement}} - R_{\text{control}})$$
   $$\text{Final Tranche}_{\text{Adjusted}} = (0.40 \times P_{\text{INR}}) + \text{Surcharge}_{\text{INR}}$$

---

## 4. Worked Calculation Example

### Assumptions:
- $C_{\text{USD}} = \$2,200$ (International expedition package per person)
- Live Spot Rate $R_{\text{spot}} = ₹83.50$
- Volatility Buffer $B_{\text{volatility}} = 3.50\%$
- Target Margin $M_{\text{target}} = 22.00\%$

### Step-by-Step Execution:
1. **Calculate Control Rate:**
   $$R_{\text{control}} = 83.50 \times (1 + 0.035) = 83.50 \times 1.035 = ₹86.4225$$

2. **Calculate Cost Floor in INR:**
   $$\text{Cost}_{\text{INR}} = 2200 \times 86.4225 = ₹1,90,129.50$$

3. **Calculate Quoted Price in INR:**
   $$P_{\text{INR}} = \frac{1,90,129.50}{1 - 0.22} = \frac{1,90,129.50}{0.78} = ₹2,43,755.77$$
   *(Rounded for consumer presentation: ₹2,44,000 / person)*

4. **Tranche Breakdown:**
   - Tranche 1 (25% Deposit): $0.25 \times 2,44,000 = ₹61,000$
   - Tranche 2 (35% Milestone): $0.35 \times 2,44,000 = ₹85,400$
   - Tranche 3 (40% Final Balance): $0.40 \times 2,44,000 = ₹97,600$ *(subject to $T-30$ settlement rule)*

---

## 5. Ledger Tracking & Audit Trail
Every calculation emitted by `/api/fx` creates an immutable record inside `fx_pricing_ledger`:
```sql
INSERT INTO fx_pricing_ledger (
    tour_id,
    booking_id,
    spot_usd_inr,
    buffer_percentage,
    quoted_price_inr,
    min_hedge_rate,
    margin_percentage,
    cost_usd,
    cost_floor_inr
) VALUES (
    'e94d8b94-82a1-4231-8fca-991204829104',
    '7bb24a51-419b-46bf-b1ae-48820f4b3972',
    83.5000,
    3.50,
    244000.00,
    86.4225,
    22.00,
    2200.00,
    190129.50
);
```
