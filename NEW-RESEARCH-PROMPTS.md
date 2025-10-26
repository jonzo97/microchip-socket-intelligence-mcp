# New Research Prompts - Priority Product Coverage Gaps

**Created**: October 21, 2025
**Purpose**: Fill critical gaps in Microchip product family coverage and market segments

---

## HIGH PRIORITY - Critical Product Family Gaps

### 1. PIC32CZ Arm Cortex-M MCUs

**Why This Matters**: Zero mentions of PIC32CZ in entire database. This is Microchip's newest 32-bit Arm-based MCU family targeting industrial, automotive, and IoT applications. Strategic product line.

**Research Objectives**:
- Market positioning of PIC32CZ (CZ CA families) vs STM32, NXP i.MX RT, Renesas RA
- Target applications: Industrial automation, motor control, connectivity hubs
- Competitive advantages: TrustZone-M security, CAN-FD, EtherCAT integration
- Win probability in industrial control vs automotive body electronics
- Price/performance vs STM32H7, i.MX RT1060, RA6 families

**Key Questions**:
- What is Microchip's competitive position in Arm Cortex-M4/M7 MCU market?
- Where does PIC32CZ win vs lose against STM32 dominance?
- Integration story: PIC32CZ + Microchip analog + connectivity = TSS?
- CAN-FD implementation quality vs NXP/Infineon

**Expected Win Rate**: 35-50% in industrial, 20-30% in automotive

---

### 2. AVR MCU Portfolio (Post-Atmel Acquisition)

**Why This Matters**: AVR is a massive volume play (ATmega/ATtiny families). Minimal coverage despite being major Microchip product line post-Atmel acquisition. Need to understand market position 8+ years post-acquisition.

**Research Objectives**:
- AVR market share in 8-bit MCU space (vs PIC16/18, STM8, Renesas RL78)
- ATmega dominance in maker/Arduino ecosystem - commercial leverage?
- AVR-DA/DB/DD modern AVR families for industrial applications
- AVR vs PIC positioning within Microchip portfolio (cannibalization?)
- China competition (GigaDevice, WCH) impact on AVR pricing

**Key Questions**:
- Is AVR still growing or legacy maintenance mode?
- Arduino ecosystem halo effect on commercial designs?
- AVR-DA/DB peripheral set competitive with modern 8-bit (STM8, Renesas)?
- Total System Solution story: AVR + EEPROM + analog?

**Expected Win Rate**: 40-55% in maker/education, 25-35% in industrial

---

### 3. 8-bit MCU Deep Dive (PIC16/18 Families)

**Why This Matters**: PIC16/18 briefly mentioned in appliance control only. These are Microchip's bread-and-butter products. Need comprehensive competitive analysis.

**Research Objectives**:
- PIC16/18 market share in 8-bit space (global + by segment)
- Competitive position vs STM8, Renesas RL78, Infineon XMC1000, China alternatives
- Core Independent Peripherals (CIP) as differentiator
- Price erosion from Chinese competition (GigaDevice, WCH, Puya)
- Migration path from 8-bit to 16-bit (dsPIC33) and 32-bit (PIC32)

**Target Applications**:
- Appliances (washing machines, HVAC - covered lightly)
- Industrial controls (sensors, actuators, simple PLCs)
- Automotive body electronics (low-end applications)
- Consumer devices (toys, small appliances, power tools)

**Key Questions**:
- What is PIC's true win rate in cost-sensitive 8-bit designs?
- Core Independent Peripherals (CIP) - real differentiator or marketing?
- Chinese competition pressure - where is MCHP losing?
- Attach rate of EEPROM, analog, interface when PIC wins MCU socket?

**Expected Win Rate**: 45-60% (established base, but under pressure)

---

### 4. CAN-FD Controllers & Transceivers

**Why This Matters**: CAN-FD mentioned as Microchip limitation/weakness in automotive research. Need full competitive analysis since this is critical for automotive body/powertrain.

**Research Objectives**:
- CAN-FD standalone controller market (MCP2517FD, MCP2518FD)
- CAN-FD transceiver market (vs TI, NXP, Infineon, Analog Devices)
- Integrated CAN-FD in MCUs (dsPIC33C, PIC32MK vs competition)
- Automotive qualification status and OEM design-in wins
- CAN XL (next-gen) - is Microchip positioned or behind?

**Key Questions**:
- What is MCHP's market share in standalone CAN-FD controllers?
- Are MCHP transceivers competitive with TI TCAN, NXP TJA, Infineon?
- Integrated CAN-FD quality vs NXP S32K, Infineon AURIX, STM32G4?
- Where does MCHP win CAN-FD designs (commercial truck, industrial, automotive tiers)?

**Expected Win Rate**: 30-45% (established CAN player, but CAN-FD newer)

---

### 5. Touch & Gesture Controllers (maXTouch)

**Why This Matters**: maXTouch mentioned in automotive HMI but not detailed. Touch interfaces are everywhere (automotive, industrial HMI, consumer). Post-Atmel acquisition, what's the competitive position?

**Research Objectives**:
- Capacitive touch controller market (maXTouch vs Synaptics, Goodix, Cypress/Infineon)
- Automotive HMI market share (instrument clusters, center displays, HVAC controls)
- Industrial HMI applications (panel PCs, machine interfaces)
- Metal mesh vs ITO electrode support for automotive
- Integration with PIC32MZ DA graphics solutions

**Target Markets**:
- Automotive: Center stack displays, clusters, steering wheel controls
- Industrial: HMI panels, kiosks, medical devices
- Consumer: Appliances, smart home controls

**Key Questions**:
- What is maXTouch market share in automotive touch (vs Synaptics, Goodix)?
- Multi-touch gesture support competitive with flagship products?
- Total System Solution: maXTouch + PIC32MZ DA + display driver?
- Win rate in industrial HMI vs Cypress (now Infineon) CapSense?

**Expected Win Rate**: 50-65% in industrial, 30-45% in automotive

---

## MEDIUM PRIORITY - Market Segment Expansion

### 6. Industrial Analog Signal Chain

**Why This Matters**: Current coverage focuses on MCUs and interfaces. Microchip has significant analog portfolio (op-amps, instrumentation amps, ADCs, DACs, comparators) that's under-represented.

**Research Focus**:
- Precision op-amps (MCP6001, MCP6V series) vs TI OPAx, ADI AD8x, Analog Devices LT
- Zero-drift amplifiers for industrial sensors
- Delta-sigma ADCs for precision measurement
- Analog front-ends (AFE) for industrial sensors
- Temperature sensors, current sense amplifiers

**Target Applications**:
- Industrial: 4-20mA sensor interfaces, PLCs, data acquisition
- Test & Measurement: Portable instruments
- Medical: Patient monitoring (non-implantable)

**Expected Win Rate**: 35-50% (strong in cost-performance, weak in flagship precision)

---

### 7. Medical Device Semiconductors

**Why This Matters**: Medical mentioned in deep-16 but focused on regulatory. Need product-specific analysis for medical device ICs.

**Research Focus**:
- MCUs for medical: PIC24F, dsPIC33C, SAM qualified for IEC 60601
- Analog for patient monitoring: ECG AFEs, pulse oximetry, temperature
- Memory for medical: Serial EEPROM, Flash for data logging, regulatory compliance
- Security: CryptoAuthentication for connected medical devices
- Wireless: Bluetooth Low Energy for wearables, patient monitors

**Target Applications**:
- Patient Monitoring: Vital signs monitors, pulse oximeters
- Diagnostic Equipment: Blood glucose meters, portable analyzers
- Infusion Pumps: Motor control (dsPIC33), safety MCUs
- Wearables: Fitness trackers, continuous glucose monitoring

**Key Questions**:
- Medical device qualification status of Microchip MCU families?
- Analog portfolio suitable for FDA/CE submissions?
- Win rate in high-volume disposables (glucose sensors) vs low-volume capital equipment?

**Expected Win Rate**: 40-55% (established medical presence)

---

### 8. Consumer IoT & Smart Home

**Why This Matters**: Heavy automotive bias in current research (87/87 files). Consumer IoT is massive volume opportunity. Need balance.

**Research Focus**:
- Smart home hubs (Thread, Matter, Zigbee)
- Connected appliances (WiFi modules, cloud integration)
- Wearables (ultra-low power MCUs, Bluetooth)
- Battery-powered sensors (PIR, door/window, environmental)
- Voice assistants (audio codecs, DSP)

**Competitive Reality**:
- Espressif dominance in WiFi IoT (ESP32 ecosystem)
- Nordic leadership in Bluetooth wearables
- Silicon Labs Thread/Zigbee for smart home
- Microchip position: SAM L ultra-low power, ATWINC WiFi (weak), RN BLE modules

**Key Questions**:
- Where does Microchip win in consumer IoT? (Likely: battery-powered, not WiFi)
- SAM L ultra-low power vs Nordic nRF, STM32L, Renesas RE - competitive?
- Matter/Thread - does Microchip have certified solutions?

**Expected Win Rate**: 25-40% (niche opportunities, not mainstream)

---

### 9. USB-C & Power Delivery Controllers

**Why This Matters**: USB-C everywhere (smartphones, laptops, automotive, industrial). USB PD market growing 20%+ CAGR. Limited mention in current research.

**Research Focus**:
- USB PD controller market (UPD350x family) vs Cypress CYPD, TI TPS65xxx, ON Semi
- USB-C port controllers for automotive infotainment, industrial
- USB Type-C authentication (security tie-in)
- Fast charging protocols (USB PD 3.1, EPR extended power)
- Alternative mode support (DisplayPort, Thunderbolt)

**Target Applications**:
- Automotive: Center console charging, rear-seat entertainment
- Industrial: HMI panels, test equipment
- Computing: Docking stations, monitors, chargers
- Consumer: Power banks, wall adapters

**Key Questions**:
- What is Microchip's market share in USB PD controllers?
- Competitive with Cypress (Infineon) leadership position?
- Total System Solution: USB PD + MCU + analog?

**Expected Win Rate**: 30-45% (established player but not leader)

---

### 10. Power Management ICs (PMICs, LDOs, DC-DC)

**Why This Matters**: Power management covered in automotive charging/battery context only. Microchip has broader power IC portfolio.

**Research Focus**:
- Low-dropout regulators (LDO) - MCP1700, MIC5205 families
- Buck/boost converters - MCP16xxx switching regulators
- PMIC (multi-rail power management) for SoC/MCU systems
- Battery chargers (Li-ion, NiMH) - beyond automotive
- Power MOSFETs (discrete) - complement to controller ICs

**Target Applications**:
- Industrial: Power supplies for automation equipment
- Computing: Point-of-load regulation for servers, workstations
- Telecom: DC-DC for 5G infrastructure, optical modules
- Automotive: Covered separately, focus on non-automotive here

**Key Questions**:
- MCHP power IC market share vs TI (dominant), Analog Devices, Infineon?
- Competitive advantages: Integration? Cost? Efficiency?
- Attach rate when Microchip wins MCU socket?

**Expected Win Rate**: 25-40% (commodity market, TI leads)

---

## STRATEGIC PRIORITY - Emerging & Competitive Gaps

### 11. Zonal Architecture Edge Node MCUs

**Why This Matters**: Automotive deep-14 identified "intelligent edge nodes" as Microchip strength. Need dedicated research on zonal architecture semiconductor opportunities.

**Research Focus**:
- Zonal ECU architecture market adoption (OEMs transitioning)
- Zone controller MCU requirements vs traditional body controllers
- Smart sensor/actuator MCUs at network edge
- Automotive Ethernet PHY+Switch combos for zone aggregation
- Security requirements (secure boot, EVITA, ISO 21434)

**Competitive Analysis**:
- Zone controllers: NXP S32G, Renesas R-Car, Infineon AURIX (high-end)
- Edge nodes: Microchip vs TI, STM, NXP lower-end MCUs
- Integration story: MCU + Ethernet + CAN-FD + LIN in single chip?

**Key Questions**:
- What is Total Addressable Market for zonal architecture semiconductors?
- Where does MCHP compete - zone controllers or edge nodes (or both)?
- Win probability in "intelligent edge" vs "central compute"?

**Expected Win Rate**: 55-70% for edge nodes, 20-35% for zone controllers

---

### 12. Hardware Security Modules (HSM) & Secure Elements

**Why This Matters**: Deep-14 identified "Microchip currently has no offering in the Hardware Security Module market. This is a significant portfolio gap."

**Research Focus**:
- Automotive HSM market (EVITA Full, EVITA Medium)
- Discrete secure elements vs integrated HSM in MCUs
- CryptoAuthentication (ATECC608, TA100) - how competitive?
- UNECE R155 compliance (cybersecurity regulations)
- Secure boot, secure OTA update requirements

**Competitive Reality**:
- Infineon: OPTIGA TPM, SLI 97 secure elements (automotive leader)
- NXP: EdgeLock SE050 (dominant in secure elements)
- STM: STSAFE, integrated HSM in STM32 (automotive qualified)
- Microchip: ATECC, TA100 (IoT auth focus, not automotive HSM)

**Key Questions**:
- Is Microchip pursuing automotive HSM market or avoiding?
- Can CryptoAuthentication substitute for HSM in some applications?
- Partnership strategy (license HSM IP from Infineon/NXP)?

**Expected Win Rate**: 15-30% (major gap, uphill battle)

---

### 13. TSN Ethernet Switches & PHYs (Deep Dive)

**Why This Matters**: We have "enhanced-01-TSN-results-no-deep-research.md" - explicitly says no deep research. But deep-01-tsn-ethernet-networking.md shows 85% win rate. Need comprehensive deep dive.

**Research Focus**:
- TSN switch market (LAN9668, LAN9698) vs Marvell, Broadcom, Intel/Altera
- Automotive Ethernet PHY market (1000BASE-T1, 100BASE-T1)
- Time synchronization accuracy (gPTP, IEEE 802.1AS)
- Industrial Ethernet protocols (PROFINET, EtherNet/IP, EtherCAT over TSN)
- 5G fronthaul (TSN for RAN synchronization)

**Competitive Analysis**:
- Switches: Marvell (88Q5050), Broadcom, Intel i225/i226
- PHYs: Marvell (88Q2xxx), Broadcom, TI DP83xxx, Analog Devices
- MCHP strengths: Complete solution (PHY + Switch + Software)
- MCHP gaps: Multi-gigabit Ethernet (2.5G, 5G, 10G)

**Key Questions**:
- Validate 85% win rate claim for TSN networking
- Where specifically does MCHP win? (Industrial automation? Automotive?)
- Is "complete solution" advantage real or marketing?
- Future roadmap: Support for 10G Ethernet, TSN+5G convergence?

**Expected Win Rate**: 70-85% (if claim validated)

---

### 14. Wireless Charging (Qi, AirFuel)

**Why This Matters**: Automotive wireless charging for phones/devices growing. Consumer electronics Qi ubiquitous. Emerging application for EVs (inductive charging pads).

**Research Focus**:
- Qi wireless charging controller market (transmitter + receiver)
- Automotive Qi charging pads (center console, door pockets)
- High-power wireless charging (WPT) for EVs, industrial robots
- AirFuel RF wireless charging vs Qi inductive
- Foreign object detection (FOD), thermal management

**Competitive Landscape**:
- NXP: Market leader in Qi automotive (MWCT10xx transmitters)
- TI: Qi receiver chips, automotive presence
- STM: STWLC, STWBC automotive wireless charging
- IDT (Renesas): Qi controllers
- Microchip: Position unclear - does MCHP have Qi products?

**Key Questions**:
- Does Microchip have wireless charging controllers?
- If yes: market share and competitive position?
- If no: strategic gap or intentionally avoided?
- EV wireless charging (inductive) - Microchip play?

**Expected Win Rate**: Unknown (need to determine if MCHP competes)

---

### 15. EtherCAT Slave Controllers

**Why This Matters**: Microchip has LAN9252 EtherCAT slave controller. Industrial fieldbus file mentions EtherCAT but not detailed. Major industrial protocol.

**Research Focus**:
- EtherCAT slave controller market (LAN9252, LAN9253) vs Beckhoff (ET1100, ET1200), TI, Hilscher
- EtherCAT master vs slave opportunities (mostly masters are PLCs)
- Market share in industrial automation (robotics, motion control, factory automation)
- Synergies with dsPIC33 motor control (EtherCAT + motor control MCU)
- Win rate vs TI Sitara with PRU-ICSS (EtherCAT capable)

**Competitive Analysis**:
- Beckhoff: EtherCAT IP owner, ET1100 dominant
- TI: Sitara AM335x with PRU-ICSS for EtherCAT
- Hilscher: netX industrial protocol chips (multi-protocol)
- MCHP: LAN9252 dedicated EtherCAT slave, integrated SPI/SQI

**Key Questions**:
- What is MCHP's LAN9252 market share in EtherCAT slaves?
- Win rate in servo drives, I/O modules, motion controllers?
- Total System Solution: LAN9252 + dsPIC33C motor control?

**Expected Win Rate**: 50-70% (strong position if validated)

---

## Research Execution Recommendations

### Tier 1 - Run First (Highest ROI)
1. **PIC32CZ** - Critical new product family gap
2. **AVR Portfolio** - Massive volume, post-acquisition integration understanding
3. **8-bit PIC16/18** - Foundational products need comprehensive analysis
4. **CAN-FD** - Known weakness, automotive critical
5. **TSN Deep Dive** - Validate claimed 85% win rate

### Tier 2 - Run Second (Fill Market Segments)
6. **Industrial Analog Signal Chain** - Balance MCU focus
7. **Touch Controllers (maXTouch)** - HMI everywhere
8. **USB-C/PD** - High-growth market
9. **Zonal Architecture** - Automotive future
10. **EtherCAT** - Industrial protocol leader

### Tier 3 - Run Third (Strategic/Nice-to-Have)
11. **Medical Devices** - Expand beyond automotive
12. **Consumer IoT** - Balance automotive bias
13. **Hardware Security Modules** - Known gap, decide strategy
14. **Power Management** - Commodity but adjacent to MCU
15. **Wireless Charging** - Determine if MCHP competes

---

## Research Prompt Template

Use this template structure for consistency (based on existing prompt format):

```markdown
# Socket Research: [Product Family / Application]

## Research Mission
[1-2 sentences: Why this research matters, what gap it fills]

## Context from Microchip
**Current Position**: [Known info from existing research]
**Key Products**: [Specific part families]
**Reality Check**: [Current win rate estimate if known]
**Key Insight Needed**: [What we need to learn]

## Research Objectives

### Market Intelligence
- Market size and growth (TAM/SAM)
- Application breakdown
- Technology trends
- Regional patterns

### Competitive Reality
- Market leaders and their share
- Microchip position (realistic)
- Price/performance benchmarks
- Ecosystem strengths/weaknesses

### Why Microchip Wins (or Loses)
- Technical advantages/gaps
- Integration benefits
- Cost position
- Brand/ecosystem

### Strategic Opportunities
- Where to attack/defend
- Partnership opportunities
- Roadmap gaps to fill
- Adjacent market plays

## Web Search Suggestions
- [Specific search queries]

## Expected Output
[Structured output format matching existing research files]
```

---

## Notes for Running Research

**Best Tools**:
- **Gemini Deep Research** - For comprehensive competitive analysis (15+ prompts)
- **Perplexity Pro** - For quick market data, specific product comparisons
- **ChatGPT** - For structured analysis of gathered data

**Research Quality Tips**:
- Request specific market share percentages
- Ask for named competitors and their products
- Seek win/loss factors grounded in customer feedback
- Request pricing data to validate cost positioning
- Look for recent analyst reports (Gartner, IDC, IHS Markit, Yole)

**Integration Notes**:
- Name files: `deep-20-pic32cz-arm-mcus.md`, `deep-21-avr-portfolio.md`, etc.
- Continue `deep-` prefix for Gemini/Perplexity research
- Export to `intelligence-database/enhanced-context/` when complete
- Update JSON database after generating new research

---

## Success Metrics

After completing these 15 prompts:
- **Product Coverage**: PIC32CZ, AVR, PIC16/18, CAN-FD, maXTouch covered
- **Market Balance**: Industrial, medical, consumer added (reduce automotive bias)
- **Strategic Clarity**: HSM gap addressed, zonal architecture validated, TSN deep dive complete
- **Database Quality**: Add ~15 high-confidence (Level A) files
- **Total Research Files**: 59 → 74 files (26% increase)

This will significantly enhance the intelligence database and provide FAEs with actionable competitive insights across Microchip's full portfolio.
