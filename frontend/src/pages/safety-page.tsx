import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const SafetyPage = () => {
  return (
    <div className="flex flex-col items-center pt-10 pb-20">
      <main className="container p-2 xl:max-w-[1000px] space-y-4">
        <div className="relative border border-border overflow-hidden bg-neutral-100 rounded-lg w-full h-[340px] flex flex-col items-center justify-center">
          <img
            src="/banner.png"
            alt="Banner"
            className="w-full object-cover h-full scale-105"
          />

          <h1 className="absolute bottom-4 left-4 text-3xl font-bold bg-gradient-to-r from-green-300 to-blue-500 bg-clip-text text-transparent">
            Safety Information
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
          <div className="h-full">
            <div className="sticky top-0">
              <h1 className="text-2xl font-bold">
                Mating Seasons & Wildlife Awareness
              </h1>
              <p>
                It's important to be aware of the mating seasons happening
                around beaches and lakes. Here's what you need to know.
              </p>
            </div>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full bg-background rounded-lg shadow-sm border border-border p-4"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg">Sharks</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    <strong>Season:</strong> In Florida, shark activity
                    increases in <strong>spring through early fall</strong> due
                    to warmer waters and baitfish migrations.
                  </li>
                  <li>
                    <strong>Travel impact:</strong> Avoid swimming near schools
                    of fish, especially at dawn/dusk.
                  </li>
                  <li>
                    <strong>Safety tip:</strong> Always swim in groups and in
                    lifeguard-patrolled areas.
                  </li>
                  <li>
                    <strong>More info:</strong> Florida Museum – Shark Safety{" "}
                    <a href="https://www.floridamuseum.ufl.edu/sharkattacks/">
                      https://www.floridamuseum.ufl.edu/sharkattacks/
                    </a>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg">Manatees</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    <strong>Season:</strong> November–March is prime season in
                    warm-water springs and coastal areas.
                  </li>
                  <li>
                    <strong>Travel impact:</strong> Be aware of boat speed zones
                    — slow down to avoid collisions.
                  </li>
                  <li>
                    <strong>Safety tip:</strong> Never touch, feed, or harass
                    manatees.
                  </li>
                  <li>
                    <strong>More info:</strong> Save the Manatee Club{" "}
                    <a href="https://savethemanatee.org/">
                      https://savethemanatee.org/
                    </a>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg">
                Sea Turtles
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    <strong>Season:</strong> Nesting runs from March to October.
                  </li>
                  <li>
                    <strong>Travel impact:</strong> Nighttime beach closures or
                    lighting restrictions may apply.
                  </li>
                  <li>
                    <strong>Safety tip:</strong> Avoid walking on dunes, keep
                    beaches dark at night, and never disturb nests.
                  </li>
                  <li>
                    <strong>More info:</strong> Florida Fish & Wildlife – Sea
                    Turtles{" "}
                    <a href="https://myfwc.com/research/wildlife/seaturtles/">
                      https://myfwc.com/research/wildlife/seaturtles/
                    </a>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg">
                Preserving Habitats
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    Stay on designated paths to avoid trampling vegetation.
                  </li>
                  <li>
                    Pack out all trash and avoid using single-use plastics
                  </li>
                  <li>
                    <strong>Safety tip:</strong> Always swim in groups and in
                    lifeguard-patrolled areas.
                  </li>
                  <li>
                    Avoid anchoring boats on seagrass beds or coral reefs.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <Separator className="my-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
          <div className="h-full">
            <div className="sticky top-0">
              <h1 className="text-2xl font-bold">
                Harmful Algal Blooms (HABs)
              </h1>
              <p>
                These are the most common algal blooms in Florida and their
                effects on the environment and people.
              </p>
            </div>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full bg-background rounded-lg shadow-sm border border-border p-4"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg">
                What to Do During a HAB
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    <strong>Travel impact:</strong> Red tide can cause
                    respiratory irritation, eye discomfort, and dead fish along
                    the shoreline. It may close beaches or fishing areas.
                  </li>
                  <li>Stay away from water when dead fish are present.</li>
                  <li>
                    Close windows if near the shore and experiencing respiratory
                    issues.
                  </li>
                  <li>
                    <strong>More info:</strong> Florida Red Tide Current Status{" "}
                    <a href="https://myfwc.com/research/redtide/statewide/">
                      https://myfwc.com/research/redtide/statewide/
                    </a>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg">
                How to Help Prevent HABs
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>Avoid using fertilizers before heavy rain.</li>
                  <li>
                    Dispose of pet waste properly to reduce nutrient runoff
                  </li>
                  <li>
                    Support local efforts for stormwater treatment and wetland
                    restoration
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg">
                Who to Contact
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    <strong>FWC Wildlife Alert Hotline:</strong> 1-888-404-3922
                    (for fish kills, sick wildlife, or HAB sightings)
                  </li>
                  <li>
                    <strong>Florida Department of Health HAB Hotline:</strong>{" "}
                    1-888-232-8635
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <Separator className="my-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
          <div className="h-full">
            <div className="sticky top-0">
              <h1 className="text-2xl font-bold">Dangers of High Tides</h1>
              <p>
                These can be life-threatening if not taken with caution when
                traveling to beaches.
              </p>
            </div>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full bg-background rounded-lg shadow-sm border border-border p-4"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg">
                Here's what to know
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    Travel impact: High tides can reduce beach space, making
                    swimming areas dangerous due to rip currents.
                  </li>
                  <li>Check local tide charts before your trip.</li>
                  <li>
                    Stay away from rocks, jetties, and seawalls during high
                    surf.
                  </li>
                  <li>
                    More info: NOAA Tide Predictions
                    https://tidesandcurrents.noaa.gov/
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <Separator className="my-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
          <div className="h-full">
            <div className="sticky top-0">
              <h1 className="text-2xl font-bold">
                Your Impact on Florida’s Coast
              </h1>
              <p>
                When visiting Florida’s beaches and coastal waters, your actions
                directly affect the health of marine life, water quality, and
                habitats.
              </p>
            </div>
          </div>
          <Accordion
            type="single"
            collapsible
            className="w-full bg-background rounded-lg shadow-sm border border-border p-4"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg">
                Do NOT litter
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    Even small trash like bottle caps, straws, and cigarette
                    butts harm marine animals who mistake them for food.
                  </li>
                  <li>
                    Dispose of all waste in designated bins or take it with you.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg">
                Do NOT use harmful sunscreens
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    Avoid sunscreens containing oxybenzone and octinoxate, which
                    damage coral reefs and marine organisms.
                  </li>
                  <li>Use reef-safe, mineral-based sunscreen instead.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg">
                Do NOT disturb wildlife
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    Never touch, chase, feed, or take selfies too close to
                    marine animals (manatees, dolphins, turtles, seabirds).
                  </li>
                  <li>Stay at least 50 feet away from wild animals.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg">
                Do NOT trample dunes or vegetation
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    These areas protect the coast from erosion and provide
                    nesting sites for turtles and birds.
                  </li>
                  <li>Always use marked beach access points</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg">
                Do NOT anchor boats on seagrass beds or coral
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    Anchors can rip up vital habitats that take decades to
                    regrow.
                  </li>
                  <li>Use designated mooring buoys when available.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg">
                Do NOT dump waste into the water
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    Includes boat sewage, leftover bait, or fish cleaning
                    scraps.
                  </li>
                  <li>Dispose of all waste at proper marina facilities</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg">
                Do NOT overuse fertilizers or pesticides at coastal properties
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ul>
                  <li>
                    Excess nutrients wash into the ocean, fueling harmful algal
                    blooms.
                  </li>
                  <li>Follow local restrictions for fertilizer use.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </div>
  );
};

export default SafetyPage;
