# Future Road Incidents & Simulation Expansion Roadmap

This document outlines proposed future road incidents, hazards, and simulation mechanics to enhance realism, strategic decision-making, and emergent gameplay in Truck Simulator.

---

## Proposed Incident Types

### 1. Weigh Station Inspection (Port of Entry)
* **Description**: Random or mandatory pull-in at state weigh stations or agricultural inspection checkpoints along major corridors.
* **Mechanics**: 
  * Checks Gross Vehicle Weight against regional limits (`maxGrossWeightTons`) and whether heavy-haul permits are active.
  * *Outcomes*: Overweight or non-compliant rigs receive fines ($500–$2,000) and temporary transit delays; compliant rigs receive a clean pass with efficiency/reputation bonuses.

### 2. Sudden Tire Blowout
* **Description**: A catastrophic tire failure during highway transit.
* **Mechanics**: 
  * Triggered by low tire tread (`tireTreadPercent < 25`), high speeds, and hot weather.
  * *Outcomes*: Forces immediate vehicle pull-over, requiring mobile tire replacement service or a short delay to swap tires, incurring repair and downtime costs.

### 3. Highway Construction Zone & Detour
* **Description**: Encountering active highway repaving or bridge maintenance zones.
* **Mechanics**: 
  * Imposes temporary speed restrictions (e.g., max 45 MPH) or requires minor route detours.
  * *Outcomes*: Adds minor ETA delays while rewarding careful speed management.

### 4. Wildlife Strike (Large Animal Collision)
* **Description**: Striking deer, elk, or livestock, particularly frequent during nighttime driving or in rural regions (e.g., Africa, rural US routes).
* **Mechanics**: 
  * Triggered by night driving, fog, or low driver alertness.
  * *Outcomes*: Causes front-end bumper/grille/headlight damage, requiring repair bay maintenance.

### 5. Cargo Shift & Loose Lashings
* **Description**: Severe weather (heavy rain, blizzards) or aggressive cornering causes cargo tie-downs to loosen.
* **Mechanics**: 
  * Driver receives an in-transit warning alert.
  * *Outcomes*: Driver must pull over to re-secure the load to avoid cargo damage or transit fines.

### 6. Rest Stop Fuel Theft (Siphoned Tanks)
* **Description**: Petty fuel theft while resting at unsecure or low-security roadside rest areas overnight.
* **Mechanics**: 
  * *Outcomes*: Small amount of diesel fuel (50–100 L) is lost upon waking, incentivizing players to invest in secure depot parking or fleet security upgrades.

### 7. Low Bridge / Clearance Close Call
* **Description**: Navigating tight urban or regional routes with low overpass clearances.
* **Mechanics**: 
  * *Outcomes*: GPS warning or minor scraper damage to trailer roof, costing minor repair fees and requiring a brief reroute.

---

## Implementation Guidelines
- Integrate these incidents cleanly into `incidentEngine.ts` with balanced probability curves.
- Ensure all weather, tire wear, brake wear, and driver skill multipliers properly influence event severity and frequency.
