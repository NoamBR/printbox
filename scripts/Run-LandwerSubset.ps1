# PrintBox - LANDWER v8 subset render
# Renders 12 cafe-relevant SKUs in v8 LANDWER brand only.
# Skip-if-exists (NEVER overwrites). Cream off-white bg locked.
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [string]$OutputDir = "c:\Users\User\Desktop\PrintBox\renders",
    [string]$Model = "gemini-3-pro-image-preview",
    [string]$ScriptDir = "c:\Users\User\Desktop\PrintBox\scripts"
)

$ErrorActionPreference = "Continue"
$gen = Join-Path $ScriptDir "Generate-Images.ps1"
$logoRef = "c:\Users\User\Desktop\PrintBox\assets\landwer_logo.png"
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null }
if (-not (Test-Path $logoRef)) { Write-Host "WARNING: logo reference not found at $logoRef" -ForegroundColor Yellow }

# Universal photography style + bg lock (matches main script)
$style = "professional product photography, soft diffuse even studio lighting from above, very gentle natural contact shadow, generous negative space around the product, sharp focus, 8k resolution, highly detailed, clean editorial catalog style, the packaging is the focal point, no extra props, no people, no environment clutter."
$bg = "isolated on a warm cream off-white seamless paper background"

# LANDWER v8 brand - uses the ATTACHED logo PNG as reference image (sent multimodally to Gemini)
$brand = @{
    name = "LANDWER"
    paperBody = "in soft warm cream-ivory uncoated paper finish (the cream base is the dominant tone, NO printed color block, the paper itself is the canvas)"
    design = "THE BRAND LOGO IS THE ATTACHED REFERENCE IMAGE. Apply the EXACT logo shown in the attached image to the product surface, preserving the exact Hebrew letterforms, the exact horizontal stripes inside each letter, the exact rectangular frame border, and the exact deep-burgundy color (hex #590B00). DO NOT redesign, DO NOT redraw, DO NOT recreate the Hebrew letters from scratch - copy the logo from the reference image verbatim and place it on the product. Position the logo modestly on the package (one logo, centered or in a natural location), at a reasonable size with generous cream negative space around it. NO additional text, NO additional badges, NO additional decoration - just the exact reference logo applied once to the cream paper packaging"
    plasticInk = "deep burgundy-oxblood (hex #590B00)"
    plasticDesign = "the EXACT logo from the attached reference image, applied verbatim on a transparent printed strip on the clear plastic surface"
}

# 12 cafe-relevant SKUs (subset of full catalog)
$products = @{
    "PB-003" = @{ form="a 16 oz single-wall paper cold drink cup fitted with a FLAT BLACK PLASTIC SIP-THROUGH LID (a flat domed lid, NOT a tall dome lid - the lid is essentially flat with a small sip opening), a slim matching color paper straw inserted through the lid"; angle="slight three-quarter front angle, eye-level camera"; type="paper" }
    "PB-004" = @{ form="a large SOS paper carrier bag with FLAT MATCHING-COLOR PAPER HANDLES (not metal, not rope, not cord), standing upright with crisp side gussets and a flat bottom"; angle="three-quarter front hero angle, eye-level camera"; type="paper" }
    "PB-005" = @{ form="a two-piece square paperboard meal box, base and lid both branded matching, lid placed on top of base"; angle="elevated 45-degree three-quarter angle showing both lid and base depth"; type="paper" }
    "PB-007" = @{ form="a quarter-folded 2-ply paper napkin"; angle="top-down flat lay, perfectly centered, very subtle 3-degree perspective"; type="paper" }
    "PB-008" = @{ form="a stack of three premium business cards in soft-touch finish, stack slightly offset to reveal edge thickness"; angle="elevated three-quarter angle showing card thickness"; type="paper" }
    "PB-014" = @{ form="a rectangular shallow paperboard donut/pastry presentation box with a hinged lid, the lid open and tilted back at 45 degrees to fully reveal a printed decorative pattern that covers the entire inside of the lid and the inside walls of the box, the exterior of the box is printed in a single solid brand color, four decorated artisan pastries arranged inside the box (croissant, palmier, almond cookie, lemon tart)"; angle="overhead three-quarter angle, both hands lightly cradling the box from the sides, the open patterned lid is the visual focal point"; type="donutbox" }
    "PB-015" = @{ form="a stand-up flat-bottom bakery bread bag with a tin-tie wire closure at the top (the top of the bag rolled down once and held shut by a small tin-tie wire across the rolled fold), the bag has a HYBRID construction: opaque printed panels in the brand color form both the top header portion (above the window) and the bottom base portion (below the window), with a large clear transparent rectangular window in the middle of the front face revealing a fresh golden-crust artisan bread loaf inside the bag, side gussets visible giving the bag a stand-up rectangular profile"; angle="slight three-quarter front hero angle, eye-level camera"; type="breadbag" }
    "PB-016" = @{ form="a rectangular molded paperboard CUP CARRIER TRAY for transporting take-away drinks, the top surface has THREE round circular cup-shaped cutout holes evenly spaced along the length to hold three cups securely, the carrier is empty (no cups in the holes for catalog clarity), side panels and front face printed in the brand color and design"; angle="elevated three-quarter front angle showing the top surface holes and the printed side panels"; type="paper" }
    "PB-027" = @{ form="a round paperboard SALAD/POKE BOWL with a squat cylindrical form (wider than it is tall, with proportions approximately 1.5:1 diameter to height), the bowl tapers very slightly (narrower at the base, wider at the rim) like a classic deli salad/poke/pasta bowl, the exterior is fully wrapped in a printed paperboard label in the brand color featuring a large bold brand wordmark, the bowl is OPEN (no lid placed on it) revealing fresh colorful salad ingredients arranged inside (mixed greens, cherry tomatoes, cubed feta, olives, herbs), beside it on the cream surface sits a separate CLEAR DOMED ROUNDED PLASTIC LID showing its concentric circular ridges (the lid is placed flat or slightly tilted next to the bowl as a companion piece, not on top of the bowl), used for salads, poke bowls, pasta bowls, soups and prepared meals"; angle="slight three-quarter front hero angle, eye-level camera, the open bowl and the separate clear dome lid both visible in frame"; type="paper" }
    "PB-028" = @{ form="a PAPER ICE CREAM PINT CONTAINER (1 PINT / 330g size), a cylindrical paperboard cup with a slight taper (wider at the top rim, narrower at the base), fitted with a WHITE OPAQUE PLASTIC SNAP-ON LID on top (the lid is flat-domed and made of solid white plastic, snapping over the rim edge, NOT clear and NOT a tall dome - a low, snug, solid white snap lid), the paperboard body is wrapped in a printed label in the brand color featuring the brand wordmark prominently centered, with a smaller 'ICE CREAM' descriptor below the wordmark, a flavor name in smaller text, and a '1 PINT / 330g' size detail along the bottom, used for ice cream, frozen yogurt, gelato and frozen desserts"; angle="slight three-quarter front hero angle, eye-level camera, the cylindrical pint container centered in frame with the white plastic lid visible on top"; type="paper" }
    "PB-029" = @{ form="a SINGLE-WALL HOT COFFEE PAPER CUP (12oz / 16oz tall coffee shop format, taller than it is wide with a slight upward taper), the cup has a SINGLE THIN PAPERBOARD WALL (note: only one wall, no extra outer sleeve, no double-layer insulation - this is the basic single-wall format), fitted with a CLASSIC RAISED BROWN PLASTIC HOT-CUP LID on top (a dark brown opaque plastic lid with a small drinking spout opening at the front, the lid bulges slightly upward in a low dome shape - the iconic coffee shop sip-through lid), the paperboard body is fully wrapped in a printed design in the brand color, used for hot coffee, tea and hot beverages"; angle="slight three-quarter front hero angle, eye-level camera, the tall coffee cup centered in frame with the raised brown plastic lid visible on top"; type="paper" }
    "PB-030" = @{ form="a DOUBLE-WALL INSULATED HOT COFFEE PAPER CUP (12oz / 16oz tall coffee shop format, taller than it is wide with a slight upward taper), the cup has a DOUBLE-LAYER PAPERBOARD CONSTRUCTION (note: two separate paper walls with an insulating air gap between them, the outer wall is the printed brand layer, the inner wall holds the hot beverage - this is the premium double-wall insulated format that requires no separate cardboard sleeve), the outer wall has a subtle visible seam where the two layers meet near the bottom rim, fitted with a CLASSIC RAISED BROWN PLASTIC HOT-CUP LID on top (a dark brown opaque plastic lid with a small drinking spout opening at the front, the lid bulges slightly upward in a low dome shape), the paperboard body is fully wrapped in a printed design in the brand color, used for premium hot coffee service without a sleeve"; angle="slight three-quarter front hero angle, eye-level camera, the tall double-wall coffee cup centered in frame with the raised brown plastic lid visible on top"; type="paper" }
    "PB-031" = @{ form="a rectangular paperboard COOKIE/SWEETS SHIPPING BOX with a hinged flip-top lid, the lid is OPEN and tilted slightly back to reveal the inside, the box contains 6 freshly baked chocolate-chip cookies arranged in a 2x3 grid inside, the interior of the box has a thin protective tissue or wrapper liner visible, the exterior surface of the box is fully printed in the brand color with a prominent brand mark centered on the top of the lid, used for cookie subscription boxes, gourmet sweet shipping and gift sets"; angle="elevated three-quarter angle showing the open lid, the contents inside, and one printed exterior side"; type="paper" }
    "PB-032" = @{ form="a round CUP-SHAPED CHICKEN BUCKET COMBO HOLDER with an integrated drink slot: the upper portion is an open bucket-shape paperboard container holding 5 pieces of crispy fried chicken visible on top, the lower portion of the same single paperboard piece has a smaller cylindrical cutout that holds a clear plastic cup full of cola with a black plastic lid and straw, this is a CLEVER ONE-HAND-HOLD combo carrier where the chicken sits on top and the drink nests through the lower ring, the entire paper exterior is fully printed in the brand color and design"; angle="three-quarter front angle showing both the chicken on top and the drink cup nested in the lower slot, a hand holding the combo container in frame"; type="paper" }
    "PB-033" = @{ form="a round CYLINDRICAL PASTRY/CAKE BOX with a paperboard base and a separate matching paperboard lid placed on top (lid covers the rim), used for layer cakes, cheesecakes and round pastries, the box exterior is wrapped in a printed paperboard label/sleeve in the brand color with a script wordmark across the lid top and decorative dripping/cake motif illustrations cascading down the side wall, a small visible separator gap shows where the lid meets the base"; angle="slight three-quarter elevated angle showing the printed lid top, the side wrap design, and the small lid-base seam"; type="paper" }
    "PB-034" = @{ form="a TWO-PIECE SLEEVE-DRAWER PAPERBOARD CAKE/BROWNIE BOX, the construction is a small rectangular inner drawer-tray (holding a fresh brownie or slice of cake visible inside) that slides OUT halfway from an outer printed sleeve, the outer sleeve is the printed brand wrap in the brand color with a wordmark on the front face, the inner tray is in clean cream paperboard, the drawer is shown half-extended so the sweet inside is visible peeking out"; angle="straight-on front hero angle, eye-level camera, the drawer slid halfway out to reveal the cake/brownie inside"; type="paper" }
    "PB-035" = @{ form="a TIED-PARCEL TAKEAWAY GIFT BOX, a small square rigid paperboard box with a tied-top handle made of natural twine or cotton cord knotted in a bow on top, the box exterior is wrapped in printed paper in the brand color (often with vertical stripes or simple repeating pattern), used for small gifts, single-serve desserts or special takeaway parcels, the closure feels like a wrapped present"; angle="slight three-quarter front hero angle showing the tied bow on top and the printed wrap"; type="paper" }
    "PB-036" = @{ form="a CONE-SHAPED NUT/SNACK PAPER BAG with two natural cotton-rope twisted-cord handles attached to the top, the bag is shaped like an upright triangular cone (wider at the top, narrower at the bottom point), made from kraft paper printed in the brand color with a simple curated illustration of nuts/produce on the front, used for nuts, fresh produce, baked goods, charcuterie items, gourmet snacks"; angle="straight-on front hero angle showing the cone silhouette and the rope handles"; type="paper" }
    "PB-037" = @{ form="a long thin rectangular MACARON PRESENTATION BOX with a separate fitting paperboard lid placed on top OR slid sideways to reveal the inside, the interior contains 6 brightly colored macarons (pink, pistachio green, lavender, lemon yellow, raspberry red, vanilla cream) arranged in a single neat row, the box exterior is printed in the brand color with a refined wordmark on the lid, used for premium patisserie presentation, often with optional ribbon"; angle="elevated three-quarter angle showing the colorful macarons inside and the printed lid pulled aside or partially open"; type="paper" }
    "PB-038" = @{ form="a large rectangular CHARCUTERIE/CATERING PLATTER PRESENTATION BOX with a hinged lid wide open to reveal the entire spread inside, the open box displays an artisanal arrangement of charcuterie meats, cheeses, fresh figs, grapes, crackers, olives, herbs and spreads in small dividers, used for premium catering, corporate events, gift baskets, the exterior is finished in the brand color with the wordmark prominently on the inside of the open lid for visual hero impact"; angle="elevated overhead three-quarter angle showing the open box with all the contents arranged inside and the printed lid interior"; type="paper" }
}

# Special handling for donutbox + breadbag types - need specific design templates
$donutboxDesign = @{
    exterior = "solid warm cream-ivory paper, NOT a printed color block - the natural cream paper is the canvas. Centered on the lid is the LANDWER LOGO: the Hebrew word 'landwer' (six Hebrew letters: lamed, nun, dalet, vav, vav, resh, reading right-to-left) where each Hebrew letter is CONSTRUCTED FROM EXACTLY 5 thin horizontal burgundy-oxblood (hex #590B00) stripes stacked vertically, the stripes form the shape of each Hebrew letter (venetian-blind louver typography). No solid fill, no outline, no badge background - just the burgundy stripes forming letter shapes directly on the cream paper"
    interior = "a densely tiled decorative pattern on a warm ivory interior base. The pattern is the REPEATED LANDWER LOGO - the Hebrew word 'landwer' (six Hebrew letters lamed-nun-dalet-vav-vav-resh) where each letter is built from EXACTLY 5 horizontal burgundy-oxblood (hex #590B00) stripes (venetian-blind louver shape forming Hebrew letters), the wordmark tiled at regular intervals across the entire interior surface. NO Latin text, NO botanical wreaths, NO other decorative elements"
}
$breadbagDesign = "the opaque top header panel and bottom base panel printed in solid warm cream-ivory paper. Centered on the header panel is the LANDWER LOGO: the Hebrew word 'landwer' (six Hebrew letters lamed-nun-dalet-vav-vav-resh, reading right-to-left) where each Hebrew letter is CONSTRUCTED FROM EXACTLY 5 thin horizontal burgundy-oxblood (hex #590B00) stripes stacked vertically (the stripes form the shape of each Hebrew letter, like venetian-blind louvers). No solid fill, no outline, no badge background - just bare burgundy stripes forming letter shapes directly on the cream paper. NO Latin text. NO botanical wreath. NO tagline. NO other decoration. Just this striped Hebrew logo"

$tasks = @()
foreach ($sku in $products.Keys | Sort-Object) {
    $prod = $products[$sku]
    switch ($prod.type) {
        "donutbox" {
            $prompt = "Mockup product photography of $($prod.form), the exterior of the box is printed in $($donutboxDesign.exterior), the interior of the lid and inside walls of the box are decorated with $($donutboxDesign.interior), the open lid prominently displays the interior pattern as the visual hero, $bg, $($prod.angle), $style"
        }
        "breadbag" {
            $prompt = "Mockup product photography of $($prod.form), $breadbagDesign, the clear transparent middle window reveals the fresh golden-crust artisan bread loaf inside the bag, the tin-tie wire closure is visible at the top, $bg, $($prod.angle), $style"
        }
        default {
            $prompt = "Mockup product photography of $($prod.form), the packaging is $($brand.paperBody), featuring $($brand.design), $bg, $($prod.angle), $style"
        }
    }
    $tasks += @{ id=$sku; prompt=$prompt }
}

$results = @()
$index = 0
$total = $tasks.Count
$skipped = 0; $generated = 0
foreach ($task in $tasks) {
    $index++
    $filename = "{0}_v8.png" -f $task.id
    $output = Join-Path $OutputDir $filename
    if (Test-Path $output) {
        Write-Host "[$index/$total] $filename - SKIP (exists)" -ForegroundColor Gray
        $skipped++
        continue
    }
    Write-Host "[$index/$total] $filename (LANDWER) ..." -ForegroundColor Cyan
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $res = & $gen -ApiKey $ApiKey -Prompt $task.prompt -OutputPath $output -Model $Model -ReferenceImage $logoRef 2>&1
        $sw.Stop()
        if (Test-Path $output) {
            $size = (Get-Item $output).Length
            Write-Host "  OK ($([math]::Round($size/1024,1)) KB, $([math]::Round($sw.Elapsed.TotalSeconds,1))s)" -ForegroundColor Green
            $generated++
        } else {
            Write-Host "  FAILED: $res" -ForegroundColor Red
        }
    } catch {
        $sw.Stop()
        Write-Host "  EXCEPTION: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== LANDWER v8 SUBSET SUMMARY ===" -ForegroundColor Yellow
Write-Host "Skipped (existing): $skipped" -ForegroundColor Gray
Write-Host "Generated (new):    $generated" -ForegroundColor Green
Write-Host "Total handled:      $total" -ForegroundColor Yellow
