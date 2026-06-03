# PrintBox - FULL CATALOG: 11 SKUs (8 original + 3 new cups) × 6 brand worlds = 66 mockups
# v1 RUBY & BUN | v2 OLIVE GROVE | v3 TOKYO LANE | v4 BIGM | v5 CRAVE LAB | v6 GREEN HARBOR
# Skip-if-exists (NEVER overwrites existing files). Cream off-white bg locked.
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [string]$OutputDir = "c:\Users\User\Desktop\PrintBox\renders",
    [string]$Model = "gemini-3-pro-image-preview",
    [string]$ScriptDir = "c:\Users\User\Desktop\PrintBox\scripts"
)

$ErrorActionPreference = "Continue"
$gen = Join-Path $ScriptDir "Generate-Images.ps1"
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null }

# Universal photography style + bg lock
$style = "professional product photography, soft diffuse even studio lighting from above, very gentle natural contact shadow, generous negative space around the product, sharp focus, 8k resolution, highly detailed, clean editorial catalog style, the packaging is the focal point, no extra props, no people, no environment clutter."
$bg = "isolated on a warm cream off-white seamless paper background"

# Six brand worlds (each = body color + design treatment)
$brands = @{
    "v1" = @{
        name = "RUBY & BUN"
        paperBody = "with a bold cherry-red printed exterior over warm cream base accents"
        design = "a large chunky condensed sans-serif wordmark 'RUBY & BUN' printed in jet black across the front, paired with a small simple flat-illustrated cheeseburger icon above the wordmark, classic American street-burger aesthetic, slight spot UV gloss highlight on the wordmark, vibrant CMYK saturation"
        plasticInk = "cherry red"
        plasticDesign = "a chunky condensed sans-serif wordmark 'RUBY & BUN' in jet black with a small flat-illustrated burger icon"
    }
    "v2" = @{
        name = "OLIVE GROVE"
        paperBody = "in soft muted sage-green uncoated matte finish with subtle warm ivory base"
        design = "an elegant thin serif wordmark 'OLIVE GROVE' printed in deep terracotta brown across the front, accompanied by a delicate hand-drawn botanical olive branch line illustration in soft gold foil, gold foil catching a faint reflection, organic wellness aesthetic, very refined and calm"
        plasticInk = "deep terracotta brown"
        plasticDesign = "an elegant thin serif wordmark 'OLIVE GROVE' with a delicate olive branch line illustration in soft gold foil"
    }
    "v3" = @{
        name = "TOKYO LANE"
        paperBody = "in deep navy indigo printed exterior with rice-white base panels"
        design = "a clean modern sans-serif wordmark 'TOKYO LANE' printed in bright tangerine orange across the front, with a single bold solid tangerine-orange geometric circle (sun mark) placed above the wordmark, screen-print aesthetic with very slight ink texture, confident modern Japanese minimal graphic design"
        plasticInk = "deep navy indigo"
        plasticDesign = "a clean modern sans-serif wordmark 'TOKYO LANE' with a solid bright tangerine orange sun-circle mark"
    }
    "v4" = @{
        name = "BIGM"
        paperBody = "with a bold bright yellow printed exterior and jet black accents"
        design = "a large chunky condensed sans-serif wordmark 'BIGM' printed in jet black across the front, paired with a bold solid black 'M' badge above the wordmark, very high CMYK saturation, fast-food street-energy aesthetic, confident and graphic, slight gloss on the print"
        plasticInk = "bright yellow"
        plasticDesign = "a chunky condensed sans-serif wordmark 'BIGM' with a bold solid black 'M' badge in jet black"
    }
    "v5" = @{
        name = "CRAVE LAB"
        paperBody = "in deep rust red printed exterior with warm cream accents, decorated with a stylized warm gold-foil dripping liquid illustration cascading down from the top edge"
        design = "a circular retro badge logo centered on the front, the badge in warm gold foil featuring a flowing script 'Crave Lab' wordmark with 'COFFEE & MORE' arched around the border, the gold foil catching soft reflections, vintage diner Americana coffee shop aesthetic, the gold-foil drip illustration runs down the surface from the top edge as a signature design motif"
        plasticInk = "rust red and warm gold"
        plasticDesign = "a circular retro 'Crave Lab' badge with 'COFFEE & MORE' arched around it, plus a signature gold-foil drip motif running down from the top"
    }
    "v6" = @{
        name = "GREEN HARBOR"
        paperBody = "in deep forest green printed exterior with warm ivory base accents"
        design = "a small circular emblem badge in soft gold foil featuring a stylized leaf-and-G monogram, paired with a clean modern sans-serif wordmark 'GREEN HARBOR' printed in warm ivory below the emblem, tiny tagline 'COFFEE & KITCHEN' under the wordmark and 'EST 2024' detail, refined artisanal café aesthetic, fresh and grounded"
        plasticInk = "deep forest green and soft gold"
        plasticDesign = "a small circular gold-foil leaf-and-G emblem with the modern sans-serif wordmark 'GREEN HARBOR' below it, plus 'COFFEE AND KITCHEN - EST 2024' tagline"
    }
    "v8" = @{
        name = "LANDWER"
        paperBody = "in soft warm cream-ivory uncoated paper finish"
        design = "the landwer brand logo placed once on the package - hebrew wordmark with horizontal stripes in deep burgundy oxblood color hex 590B00 inside a thin rectangular frame, no other decoration"
        plasticInk = "deep burgundy-oxblood (hex 590B00)"
        plasticDesign = "the landwer striped-hebrew logo in burgundy on a transparent strip"
    }
}

# Eleven products (8 originals + 3 new cup variants)
$products = @{
    "PB-001" = @{ form="a hinged paperboard burger clamshell box, closed position"; angle="slight three-quarter front hero angle, eye-level camera"; type="paper" }
    "PB-002" = @{ form="a corrugated B-flute kraft burger box with hinged top closed (preserve visible B-flute corrugation along the side edges under the brand design)"; angle="slight three-quarter front hero angle, eye-level camera"; type="paper" }
    "PB-003" = @{ form="a 16 oz single-wall paper cold drink cup fitted with a FLAT BLACK PLASTIC SIP-THROUGH LID (a flat domed lid, NOT a tall dome lid - the lid is essentially flat with a small sip opening), a slim matching color paper straw inserted through the lid"; angle="slight three-quarter front angle, eye-level camera"; type="paper" }
    "PB-004" = @{ form="a large SOS paper carrier bag with FLAT MATCHING-COLOR PAPER HANDLES (not metal, not rope, not cord), standing upright with crisp side gussets and a flat bottom"; angle="three-quarter front hero angle, eye-level camera"; type="paper" }
    "PB-005" = @{ form="a two-piece square paperboard meal box, base and lid both branded matching, lid placed on top of base"; angle="elevated 45-degree three-quarter angle showing both lid and base depth"; type="paper" }
    "PB-006" = @{ form="a paper fries scoop snack cup with tapered open top and flat bottom"; angle="slight three-quarter front angle showing the open scoop top"; type="paper" }
    "PB-007" = @{ form="a quarter-folded 2-ply paper napkin"; angle="top-down flat lay, perfectly centered, very subtle 3-degree perspective"; type="paper" }
    "PB-008" = @{ form="a stack of three premium business cards in soft-touch finish, stack slightly offset to reveal edge thickness"; angle="elevated three-quarter angle showing card thickness"; type="paper" }
    # NEW SKUs
    "PB-009" = @{ form="a U-shape tapered paper cup (a sundae/shake/dessert cup style, wider at the top, narrower at the bottom, with a gentle curved U silhouette, made from food-grade paper), fitted with a FLAT BLACK PLASTIC SIP-THROUGH LID, a slim matching color paper straw inserted through the lid"; angle="slight three-quarter front angle, eye-level camera"; type="paper" }
    "PB-010" = @{ form="a U-shape tapered TRANSPARENT CLEAR PLASTIC PET cup (NOT paper, fully see-through transparent cup, wider at the top, narrower at the bottom, with a gentle curved U silhouette), fitted with a flat black plastic lid, a slim matching color paper straw inserted through the lid, ice cubes and condensation visible inside the clear cup"; angle="slight three-quarter front angle, eye-level camera"; type="plastic" }
    "PB-011" = @{ form="a standard cylindrical 16 oz TRANSPARENT CLEAR PLASTIC PET cold drink cup (NOT paper, fully see-through transparent cup), fitted with a flat black plastic lid, a slim matching color paper straw inserted through the lid, ice cubes and condensation visible inside the clear cup"; angle="slight three-quarter front angle, eye-level camera"; type="plastic" }
    # NEW: Wrap paper + Sachet pouch + Donut box
    "PB-012" = @{ form="a rectangular sheet of food-grade greaseproof wrapping paper used for sandwiches and burgers, shown as a single sheet draped and softly folded with visible natural creases, the printed brand pattern repeats across the entire surface as the focal design element"; angle="three-quarter overhead angle showing the folded layers and pattern detail"; type="wrap" }
    "PB-013" = @{ form="a small single-serve flat resealable laminate-film sachet pouch with a clear transparent square window in the center of the front face revealing a chocolate-chip cookie inside the pouch, the upper and lower panels of the pouch are fully opaque and printed in the brand color, a small notched tear-line at the top, the pouch sits flat with subtle natural wrinkles"; angle="straight-on front facing flat lay with very slight 5-degree perspective"; type="sachet" }
    "PB-014" = @{ form="a rectangular shallow paperboard donut/pastry presentation box with a hinged lid, the lid open and tilted back at 45 degrees to fully reveal a printed decorative pattern that covers the entire inside of the lid and the inside walls of the box, the exterior of the box is printed in a single solid brand color, four decorated artisan donuts arranged inside the box (a glazed donut with white drizzle, a sprinkles donut, a crumble-topped donut, a meringue donut with yellow cream)"; angle="overhead three-quarter angle, both hands lightly cradling the box from the sides, the open patterned lid is the visual focal point"; type="donutbox" }
    "PB-015" = @{ form="a stand-up flat-bottom bakery bread bag with a tin-tie wire closure at the top (the top of the bag rolled down once and held shut by a small tin-tie wire across the rolled fold), the bag has a HYBRID construction: opaque printed panels in the brand color form both the top header portion (above the window) and the bottom base portion (below the window), with a large clear transparent rectangular window in the middle of the front face revealing a fresh golden-crust artisan bread loaf inside the bag, side gussets visible giving the bag a stand-up rectangular profile"; angle="slight three-quarter front hero angle, eye-level camera"; type="breadbag" }
    "PB-016" = @{ form="a rectangular molded paperboard CUP CARRIER TRAY for transporting take-away drinks, the top surface has THREE round circular cup-shaped cutout holes evenly spaced along the length to hold three cups securely, the carrier is empty (no cups in the holes for catalog clarity), side panels and front face printed in the brand color and design"; angle="elevated three-quarter front angle showing the top surface holes and the printed side panels"; type="paper" }
    "PB-017" = @{ form="a rectangular shallow paperboard CUTLERY DELIVERY TRAY (long thin format used for delivery utensil packs), the open tray contains a matte black metallic fork, knife and spoon resting inside neatly arranged, the tray exterior is printed in the brand color and design, the interior is left in clean cream paperboard"; angle="elevated three-quarter overhead angle showing both the printed exterior side and the cutlery resting inside the open tray"; type="paper" }
    "PB-018" = @{ form="a closed rectangular rigid premium LUXURY GIFT BOX with a fully metallic foil-laminated finish in the brand color (mirror-like reflective foil-laminate finish across the entire exterior surface, the box has a separate telescoping lid placed snugly on top of the base, a thin coordinating-color cord or ribbon optionally wrapped around it, used for premium gifting, pastries, chocolates or seasonal sets"; angle="slight three-quarter hero angle, eye-level camera, the metallic foil finish catches soft directional light highlights"; type="luxurybox" }
    "PB-019" = @{ form="a closed GABLE-TOP paperboard box (also called barn-roof box or chicken meal box), the classic gable form with two angled roof panels meeting at a top ridge that is pinched together to form a built-in carry handle slot, the front face flat and the top panels angled inward, used for chicken meals, party meals, kids meals, the entire exterior printed in the brand color and design"; angle="three-quarter front hero angle showing the gable top handle and the printed front face"; type="paper" }
    "PB-020" = @{ form="a rectangular flip-top paperboard CHICKEN COMBO MEAL BOX, the box is closed showing the flat printed front face, with a small die-cut window flap (a partial cutout in the top that doubles as a tear-open access point and viewing window) revealing a hint of golden fried chicken inside, used for chicken combo meals and family-size takeaway, the exterior fully printed in the brand color and design"; angle="three-quarter front hero angle showing the closed front face and the die-cut window flap on top"; type="paper" }
    "PB-021" = @{ form="a rectangular paperboard 6-CELL DIVIDED DONUT BOX, the box is OPEN with the hinged lid tilted back at 60 degrees, the interior has internal cardboard dividers creating six individual square cells (a 2x3 grid) each holding ONE decorated donut, the exterior is printed with a candy-stripe pattern (alternating thin vertical stripes in the brand color and warm cream), the interior of the open lid is decorated with playful flat-illustrated donut artwork in soft complementary pastel colors plus a brand wordmark in one corner, six different decorated donuts visible inside the cells"; angle="elevated three-quarter angle showing the open lid pattern and the six divided cells, the box sits on a warm wooden cafe table with a small espresso cup on a saucer beside it for soft context"; type="donutgrid" }
    "PB-022" = @{ form="a thin shallow low-profile paperboard CUTLERY DELIVERY TRAY in a boat-shape rectangular form (very low side walls, only about 2 cm tall, the same thin-profile silhouette as a delivery utensil sleeve), the tray is COMPLETELY EMPTY (no cutlery, no utensils, nothing inside) so the clean clean cream-colored interior is fully visible, the exterior side panels and front face are printed in the brand color and design, this is a clean product-only shot showing the tray itself"; angle="elevated three-quarter angle showing the empty interior, the thin profile of the side walls, and the printed exterior front face"; type="paper" }
    "PB-023" = @{ form="a TRIANGULAR paperboard pizza slice box (an isoceles triangle silhouette, the pointed tip facing down or to the side, the box is closed with a hinged lid forming a flat top), the top surface is the primary design canvas printed in the brand color, the entire box is shaped to fit a single pizza slice, used for single-slice take-away"; angle="straight-on top-down view showing the full triangular silhouette flat to the camera, OR a very slight three-quarter angle showing the thin side profile"; type="paper" }
    "PB-024" = @{ form="a classic SQUARE CORRUGATED PIZZA DELIVERY BOX with the closed flat lid printed in the brand color and design, a side-view edge of B-flute corrugated cardboard visible along the edge, side walls printed solid in the brand color with the brand wordmark stamped repeatedly along the side, the box is the standard flat square pizza-delivery format"; angle="slight three-quarter elevated angle showing the printed top lid and one printed side wall edge"; type="paper" }
    "PB-025" = @{ form="a TALL NARROW CYLINDRICAL paperboard sushi/snack TUBE container (a vertical cylinder roughly 4 times taller than it is wide, like a long thin can), fitted with a CLEAR TRANSPARENT round plastic lid on top, the entire paper cylinder body wrapped and printed in the brand color and design, used for sushi rolls, breadsticks or vertical snacks"; angle="straight-on front-facing angle, eye-level camera, showing the full vertical cylinder height and the clear lid on top"; type="paper" }
    "PB-026" = @{ form="a CYLINDRICAL paperboard SUSHI/SNACK TUBE CONTAINER with VERY SPECIFIC shape: a vertical cylinder with proportions exactly 4:1 height to diameter (moderately tall canister, not extremely narrow), fitted with a CLEAR DOMED ROUNDED PLASTIC LID on top (a clear plastic dome that bulges slightly upward in the center, NOT a flat lid, with a thin black plastic rim/ridge encircling the lid where it meets the tube), the base of the tube sits in a small black plastic ring/bottom collar, the paper cylinder body is wrapped in a brand-colored printed label that covers most of the cylinder leaving a small clean ivory band at the very bottom above the black ring, the brand label features the wordmark vertically aligned on the front face plus a delicate food illustration (sushi-roll or product-relevant motif) and an optional decorative cherry-blossom or botanical accent toward one side, used for sushi rolls, breadsticks, snacks, or specialty rolled foods"; angle="straight-on front-facing eye-level angle, the cylinder centered in frame, showing the full vertical height including the clear domed lid on top with its black rim and the small black ring base at the bottom"; type="paper" }
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

# Brand-specific patterns / flavors for the new SKUs
$wrapPatterns = @{
    "v1" = "a tiled cherry-red ink pattern repeating across the paper of small flat-illustrated burger icons, the 'RUBY & BUN' wordmark stamped at intervals in jet black, plus small dot accents, classic American street-burger newsprint aesthetic"
    "v2" = "a tiled pattern in soft gold foil and faded terracotta of delicate hand-drawn olive sprigs, the 'OLIVE GROVE' serif wordmark stamped at intervals in deep terracotta, plus tiny 'FRESH DAILY' badges, refined wellness aesthetic"
    "v3" = "a tiled pattern in deep navy indigo and tangerine orange of small sun-circle marks, simple ramen-bowl icons and chopstick lines, the 'TOKYO LANE' modern sans wordmark stamped at intervals in tangerine, screen-print aesthetic"
    "v4" = "a tiled pattern in bright yellow and jet black of repeated bold 'M' badges and 'BIGM' wordmarks, simple flat-illustrated burger and fries icons, high CMYK saturation, fast-food street energy"
    "v5" = "a tiled pattern in rust red and warm gold foil of the circular 'Crave Lab COFFEE & MORE' badge stamped repeatedly, with gold-foil drip illustrations weaving between, vintage Americana coffee shop aesthetic"
    "v6" = "a tiled pattern in deep forest green and soft gold foil of small leaf-and-G circular emblems, the 'GREEN HARBOR' modern sans wordmark stamped at intervals in ivory, with delicate gold botanical line accents, refined artisanal cafe aesthetic"
}

$sachetDesigns = @{
    "v1" = "the opaque panels printed in solid cherry red, a chunky condensed sans-serif wordmark 'RUBY & BUN' in jet black across the top panel, the flavor name 'STREET BITE' in jet black across the bottom panel, plus a small flat-illustrated burger icon"
    "v2" = "the opaque panels printed in soft muted sage green, an elegant thin serif wordmark 'OLIVE GROVE' in deep terracotta brown across the top panel, the flavor name 'OAT & HONEY' in terracotta across the bottom panel, plus a small soft-gold-foil olive-branch line illustration"
    "v3" = "the opaque panels printed in deep navy indigo, a clean modern sans-serif wordmark 'TOKYO LANE' in bright tangerine orange across the top panel, the flavor name 'MATCHA CRUNCH' in tangerine across the bottom panel, plus a solid tangerine sun-circle mark"
    "v4" = "the opaque panels printed in bright yellow, a chunky condensed sans-serif wordmark 'BIGM' in jet black across the top panel, the flavor name 'BIG BITE' in jet black across the bottom panel, plus a bold solid black 'M' badge"
    "v5" = "the opaque panels printed in deep rust red, a circular gold-foil 'Crave Lab COFFEE & MORE' retro badge centered on the top panel, the flavor name 'CADILLAC CRUNCH' in warm gold foil across the bottom panel, with a small gold-foil drip motif along the seal edge"
    "v6" = "the opaque panels printed in deep forest green, a small circular gold-foil leaf-and-G emblem on the top panel beside the clean modern sans wordmark 'GREEN HARBOR' in warm ivory, the flavor name 'MORNING OAT' in ivory across the bottom panel"
}

$donutGridDesigns = @{
    "v1" = @{ stripe = "cherry red and warm cream candy-stripe"; wordmark = "the 'RUBY & BUN' wordmark in chunky condensed jet-black sans-serif stamped along the lower front edge"; interior = "playful flat-illustrated burger and donut icons in soft pastels (peach, cream, dusty red, butter yellow) with a small 'RUBY & BUN' wordmark in the lower right corner of the lid in cherry red" }
    "v2" = @{ stripe = "soft sage green and warm ivory candy-stripe"; wordmark = "the 'OLIVE GROVE' wordmark in elegant thin terracotta serif stamped along the lower front edge"; interior = "playful flat-illustrated donuts and olive-sprig icons in soft pastels (sage, ivory, dusty terracotta, gentle gold) with a small 'OLIVE GROVE' serif wordmark in the lower right corner of the lid in terracotta" }
    "v3" = @{ stripe = "deep navy indigo and rice-white candy-stripe"; wordmark = "the 'TOKYO LANE' wordmark in clean modern tangerine sans-serif stamped along the lower front edge"; interior = "playful flat-illustrated donuts and sun-circle icons in soft pastels (rice white, soft navy, peach, gentle tangerine) with a small 'TOKYO LANE' modern sans wordmark in the lower right corner of the lid in tangerine" }
    "v4" = @{ stripe = "bright yellow and jet-black candy-stripe"; wordmark = "the 'BIGM' wordmark in chunky condensed jet-black sans-serif stamped along the lower front edge"; interior = "playful flat-illustrated donut and burger icons in soft pastels (butter yellow, cream, peach, dusty pink) plus tiny 'M' badges with a small 'BIGM' wordmark in the lower right corner of the lid in jet black" }
    "v5" = @{ stripe = "deep rust red and warm cream candy-stripe"; wordmark = "the 'Crave Lab' script wordmark in warm gold foil stamped along the lower front edge"; interior = "playful flat-illustrated donuts, coffee cups and drip motifs in soft warm pastels (cream, peach, dusty rust, gold) with a small circular 'Crave Lab COFFEE AND MORE' badge in warm gold foil in the lower right corner of the lid" }
    "v6" = @{ stripe = "deep forest green and warm ivory candy-stripe"; wordmark = "the 'GREEN HARBOR' wordmark in clean modern soft-gold sans-serif stamped along the lower front edge"; interior = "playful flat-illustrated donuts, leaves and small G-emblems in soft pastels (ivory, sage, soft gold, dusty olive) with a small circular leaf-and-G emblem in gold foil in the lower right corner of the lid" }
}

$luxuryBoxDesigns = @{
    "v1" = @{ foilColor = "cherry red metallic foil-laminate (mirror-like reflective cherry red surface)"; mark = "a small jet-black 'RUBY & BUN' wordmark debossed in the lower right corner with a tiny burger icon, plus an optional thin black cord wrapped around the box" }
    "v2" = @{ foilColor = "soft sage green metallic foil-laminate (mirror-like reflective sage surface)"; mark = "an elegant thin serif 'OLIVE GROVE' wordmark debossed in the lower right corner in soft gold foil with a tiny olive sprig, plus a thin terracotta cord wrapped around the box" }
    "v3" = @{ foilColor = "deep navy indigo metallic foil-laminate (mirror-like reflective navy surface)"; mark = "a clean modern sans 'TOKYO LANE' wordmark debossed in the lower right corner in bright tangerine orange with a small tangerine sun-circle mark, plus a thin tangerine cord wrapped around the box" }
    "v4" = @{ foilColor = "bright yellow metallic foil-laminate (mirror-like reflective yellow surface)"; mark = "a chunky condensed sans 'BIGM' wordmark debossed in the lower right corner in jet black with a small black 'M' badge, plus a thin black cord wrapped around the box" }
    "v5" = @{ foilColor = "warm gold metallic foil-laminate (mirror-like reflective warm gold surface)"; mark = "a circular debossed 'Crave Lab COFFEE AND MORE' retro badge stamped lightly into the gold foil in the upper corner, plus a thin rust red cord wrapped around the box and a subtle gold-foil-on-gold drip motif along one edge" }
    "v6" = @{ foilColor = "deep forest green metallic foil-laminate (mirror-like reflective forest green surface)"; mark = "a small circular soft-gold-foil leaf-and-G emblem debossed in the lower right corner with the modern sans 'GREEN HARBOR' wordmark in soft gold beside it, plus a thin ivory cord wrapped around the box" }
}

$breadBagDesigns = @{
    "v1" = "the opaque header panel and base panel printed in solid cherry red, a chunky condensed sans-serif wordmark 'RUBY & BUN' in jet black centered on the header, a small jet-black 'FRESH BAKED - 100% PURE' tagline below it, plus a small flat-illustrated burger icon in the top corner, classic American street-burger aesthetic"
    "v2" = "the opaque header panel and base panel printed in soft muted sage green, an elegant thin serif wordmark 'OLIVE GROVE' in soft gold foil centered on the header, a small 'ARTISAN BAKERY - FRESH DAILY' tagline in gold below it, plus a delicate hand-drawn gold-foil olive-branch line illustration in the top corner, refined wellness aesthetic"
    "v3" = "the opaque header panel and base panel printed in deep navy indigo, a clean modern sans-serif wordmark 'TOKYO LANE' in bright tangerine orange centered on the header, a small 'BAKED FRESH - OPEN DAILY' tagline in tangerine below it, plus a single solid tangerine sun-circle mark in the top corner, modern minimal Japanese graphic"
    "v4" = "the opaque header panel and base panel printed in bright yellow, a chunky condensed sans-serif wordmark 'BIGM' in jet black centered on the header, a bold 'BIG BAKERY - BIG BITES' tagline in jet black below it, plus a solid black 'M' badge in the top corner, high CMYK saturation, fast-food street energy"
    "v5" = "the opaque header panel and base panel printed in deep rust red, a circular gold-foil 'Crave Lab COFFEE & MORE' retro badge centered on the header, a small 'ARTISAN LOAVES - BAKED DAILY' tagline in gold foil below it, plus a small gold-foil drip motif weaving across the panel edges, vintage Americana coffee shop aesthetic"
    "v6" = "the opaque header panel and base panel printed in deep forest green, a small circular soft-gold-foil leaf-and-G emblem in the top corner, a clean modern sans-serif wordmark 'GREEN HARBOR' in warm ivory centered on the header, a small ivory 'BAKERY - COFFEE - KITCHEN - EST 2024' tagline below it, refined artisanal cafe aesthetic"
}

$donutBoxDesigns = @{
    "v1" = @{ exterior = "solid cherry red"; interior = "a densely tiled decorative pattern in cream and jet black ink on a warm cream interior base, featuring repeated small flat-illustrated burger icons interwoven with the 'RUBY & BUN' chunky sans-serif wordmark and small decorative dot accents, classic American street-burger aesthetic" }
    "v2" = @{ exterior = "solid muted sage green"; interior = "a densely tiled decorative pattern in soft gold foil and deep terracotta on a warm ivory interior base, featuring elegant repeated hand-drawn olive-branch botanical illustrations interwoven with the 'OLIVE GROVE' thin serif wordmark and tiny 'FRESH' badges, refined wellness aesthetic" }
    "v3" = @{ exterior = "solid deep navy indigo"; interior = "a densely tiled decorative pattern in bright tangerine orange and navy ink on a rice-white interior base, featuring repeated geometric sun-circle marks interwoven with small ramen bowl icons, chopstick lines, and the 'TOKYO LANE' modern sans wordmark, screen-print aesthetic" }
    "v4" = @{ exterior = "solid bright yellow"; interior = "a densely tiled decorative pattern in jet black ink on a cream interior base, featuring repeated bold 'M' badges interwoven with the 'BIGM' chunky condensed sans wordmark and simple flat-illustrated burger and fries icons, high CMYK saturation, fast-food street energy" }
    "v5" = @{ exterior = "solid rust red"; interior = "a densely tiled decorative pattern in warm gold foil on a cream interior base, featuring the repeated 'Crave Lab COFFEE & MORE' circular retro badge interwoven with cascading gold-foil drip illustrations, vintage Americana coffee shop aesthetic" }
    "v6" = @{ exterior = "solid deep forest green"; interior = "a densely tiled decorative pattern in soft gold foil and forest green on a warm ivory interior base, featuring repeated small circular leaf-and-G emblems interwoven with delicate gold botanical line illustrations and the 'GREEN HARBOR' modern sans wordmark, refined artisanal cafe aesthetic" }
}

$tasks = @()
foreach ($sku in $products.Keys | Sort-Object) {
    foreach ($v in @("v1","v2","v3","v4","v5","v6")) {
        $b = $brands[$v]
        $prod = $products[$sku]
        switch ($prod.type) {
            "plastic" {
                # Clear PET cups: body stays transparent, branding printed on outside as wrap-around band
                $prompt = "Mockup product photography of $($prod.form), the brand is printed in $($b.plasticInk) ink as a wrap-around band on the outer surface of the clear cup, featuring $($b.plasticDesign), the cup itself remains fully transparent so ice and drink are visible through the plastic, $bg, $($prod.angle), $style"
            }
            "wrap" {
                # Greaseproof wrap paper: pattern fills the entire sheet as the design hero
                $prompt = "Mockup product photography of $($prod.form), the sheet is printed with $($wrapPatterns[$v]), the printed pattern is the entire focal design covering the paper, $bg, $($prod.angle), $style"
            }
            "sachet" {
                # Single-serve sachet: opaque brand panels + clear window
                $prompt = "Mockup product photography of $($prod.form), $($sachetDesigns[$v]), the clear window in the middle reveals the cookie inside, $bg, $($prod.angle), $style"
            }
            "donutbox" {
                # Donut/pastry box: solid color exterior + patterned interior reveal
                $db = $donutBoxDesigns[$v]
                $prompt = "Mockup product photography of $($prod.form), the exterior of the box is printed in $($db.exterior), the interior of the lid and inside walls of the box are decorated with $($db.interior), the open lid prominently displays the interior pattern as the visual hero, $bg, $($prod.angle), $style"
            }
            "breadbag" {
                # Bread/bakery stand-up bag with tin-tie + clear window
                $prompt = "Mockup product photography of $($prod.form), $($breadBagDesigns[$v]), the clear transparent middle window reveals the fresh golden-crust artisan bread loaf inside the bag, the tin-tie wire closure is visible at the top, $bg, $($prod.angle), $style"
            }
            "luxurybox" {
                # Premium foil-laminated gift box in brand-color metallic finish
                $lb = $luxuryBoxDesigns[$v]
                $prompt = "Mockup product photography of $($prod.form), the entire exterior is finished in $($lb.foilColor), $($lb.mark), the foil-laminate surface catches subtle soft directional light highlights without harsh glare, $bg, $($prod.angle), $style"
            }
            "donutgrid" {
                # 6-cell divided donut box with stripe exterior + illustrated interior lid
                $dg = $donutGridDesigns[$v]
                $prompt = "Mockup product photography of $($prod.form), the exterior is printed with a $($dg.stripe) candy-stripe pattern of alternating thin vertical stripes, $($dg.wordmark), the interior of the open lid is decorated with $($dg.interior), six donuts visible in the six cells (chocolate with sprinkles, glazed with white drizzle, chocolate with crushed nuts, strawberry frosted, vanilla frosted with sprinkles, plain ring), $bg, $($prod.angle), $style"
            }
            default {
                # Paper packaging default: body takes the brand body color/treatment, single wordmark/design
                $prompt = "Mockup product photography of $($prod.form), the packaging is $($b.paperBody), featuring $($b.design), $bg, $($prod.angle), $style"
            }
        }
        $tasks += @{ id=$sku; variant=$v; brand=$b.name; prompt=$prompt }
    }
}

$results = @()
$index = 0
$total = $tasks.Count
$skipped = 0
$generated = 0
foreach ($task in $tasks) {
    $index++
    $filename = "{0}_{1}.png" -f $task.id, $task.variant
    $output = Join-Path $OutputDir $filename
    if (Test-Path $output) {
        Write-Host "[$index/$total] $filename ($($task.brand)) - SKIP (exists)" -ForegroundColor Gray
        $skipped++
        $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; brand=$task.brand; file=$filename; status="SKIPPED"; size_kb=[math]::Round((Get-Item $output).Length/1024,1); seconds=0 }
        continue
    }
    Write-Host "[$index/$total] $filename ($($task.brand)) ..." -ForegroundColor Cyan
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $res = & $gen -ApiKey $ApiKey -Prompt $task.prompt -OutputPath $output -Model $Model 2>&1
        $sw.Stop()
        if (Test-Path $output) {
            $size = (Get-Item $output).Length
            Write-Host "  OK ($([math]::Round($size/1024,1)) KB, $([math]::Round($sw.Elapsed.TotalSeconds,1))s)" -ForegroundColor Green
            $generated++
            $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; brand=$task.brand; file=$filename; status="OK"; size_kb=[math]::Round($size/1024,1); seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        } else {
            Write-Host "  FAILED: $res" -ForegroundColor Red
            $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; brand=$task.brand; file=$filename; status="FAILED"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        }
    } catch {
        $sw.Stop()
        Write-Host "  EXCEPTION: $($_.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; brand=$task.brand; file=$filename; status="EXCEPTION"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
    }
}

Write-Host "`n=== FULL CATALOG RENDER SUMMARY ===" -ForegroundColor Yellow
Write-Host "Skipped (already existed): $skipped" -ForegroundColor Gray
Write-Host "Generated (new): $generated" -ForegroundColor Green
Write-Host "Total handled: $total" -ForegroundColor Yellow
$results | ConvertTo-Json -Depth 3 | Out-File -FilePath (Join-Path $OutputDir "_full_catalog_log.json") -Encoding utf8
