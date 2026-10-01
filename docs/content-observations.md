# Content observations

These observations describe inconsistencies within the existing local catalog. They do not establish which dietary rule is correct, verify external medical claims, or change any source text, food classification, recipe or link. Reference validation passes because the referenced entities exist; semantic contradictions require a separate content review.

## Zucchini classification in a recipe

`src/data/recipes.ts` (`stuffed-zucchini`) describes zucchini as disputed and says the source also places it among prohibited foods. `src/data/foods.ts` (`zucchini`) currently classifies it as `conditional`, with cooked/stuffed preparation allowed. The recipe's stated classification and the linked food classification differ.

## Yellow lentil soup reference

`src/data/recipes.ts` (`yellow-lentil-soup`) contains yellow lentils but links to the bundled `legumes` record, classified `notRecommended`. The dedicated `yellow-lentils` record is `conditional` and explicitly labels the preparation exception as a circulating practice without a direct statement from the system's creator. The soup description does not repeat that qualification.

The guide's week-four step and the `vs-keto` FAQ summarize legumes as prohibited. The generic `legumes` record already explains that some specific preparations are circulating exceptions. Readers may see different answers depending on whether they open the generic summary or a specific food.

## Garlic in recipes

The `garlic` food record is `notRecommended` and explicitly prohibits raw, cooked, seasoning and powdered forms. Recipes `rice-potatoes-taro-lunch`, `rice-with-okra-bamia` and `moussaka-minced-meat` include garlic in their ingredients or instructions without referencing that record or explaining an exception. All declared `foodIds` resolve, but the declared IDs do not cover every ingredient written in prose.

## Cream soup title

`creamy-chicken-soup` is titled as soup with chicken or meat, while its description and ingredients specify meat or permitted birds (pigeon). The farm-chicken food record is `notRecommended`. The title can suggest a broader choice than the actual recipe ingredients.

## Provenance limits

The `tayyibat-research-pdf` source has no URL or document locator in `src/data/sources.ts`. This is an allowed optional field, so it is not a broken reference, but a reader cannot open the local research document from that entry. The doctor's `unverified` array contains two `[CONTENT REQUIRED]` markers for books and academic publications; these are explicit unresolved content placeholders.

## Search ambiguity

Some short queries intentionally overlap several catalog records. For example, `رومي` currently ranks turkey above aged cheese, and `فاصوليا` retrieves the bundled prohibited legume card while specific bean preparations can have a conditional classification. The validation suite checks retrieval and selected unambiguous rankings; it does not resolve ambiguous aliases or change the catalog's rules.
