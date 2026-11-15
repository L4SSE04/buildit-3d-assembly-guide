# Scoring a scan against its manual

Used with `npm run eval`: every manual in the test set is scanned, then each step is looked at side by side with its
manual page (`server/data/xcheck/<guide id>/stepNN.jpg`). The automatic check is not a score: it only tests that a
guide agrees with itself, not with the paper.

## Per manual

1. **Parts list** (0–100 %): of the parts and fittings printed in the manual's parts pages, how many are in the
   guide with the right label and count.
2. **Steps** (0–100 %): every guide step gets 0, 1 or 2 points on each of four questions, then the average:
   - **Parts:** are the right boards and fittings taken and shown as new in this step?
   - **Placement:** are they where the drawing shows them, the right way round, in the manual's working position
     (lying flat, upside down) where it uses one?
   - **Fittings:** do screws, dowels, cam locks go into the right board, face and holes?
   - **Recognisable:** would someone holding the real part recognise it in the 3D view?

   2 = matches the drawing, 1 = partly (a person would still manage), 0 = wrong or missing.
3. **Coverage:** manual steps that are missing from the guide, and guide steps that are not in the manual.

## Keeping a change

A change to the prompt or the pipeline is kept only if the average over the dev set goes up **and** no manual drops by
more than 5 points. The held-out manuals (`*-heldout.pdf`) are scored only now and then, never used to decide a change.
Each round gets one line in `eval/CHANGELOG.md`: date, change, scores before → after, cost.
