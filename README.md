# Spatial User Interfaces Mini-Project

This project is a mobile AR prototype for comparing two pointing techniques for target selection.

The course topic is `Pointing metaphors`.

The app presents a small AR target-selection task using balloons as targets.

The user completes the same task with two different interaction techniques:

1. `Standard Pointing`
2. `Proximity-Assisted Pointing`

The goal is to compare how the two techniques perform for mobile AR target selection.

## What Is Being Compared

### 1. Standard Pointing

This is the baseline technique.

- The user aims using a center reticle
- The user points at the balloon
- The user presses `Confirm Selection` to select the target

### 2. Proximity-Assisted Pointing

This is the novel technique.

- The user still aims using the same center reticle
- The app provides stronger feedback when alignment is good
- The target is selected automatically after a short stable dwell
- This reduces the need for explicit confirmation

## Task Design

The comparison uses the same task for both techniques.

- One balloon appears at a time
- Each technique uses `10 trials`
- Each trial has a `5 second` time limit
- There is a short delay between balloons

### Trial Outcome

- `Success`: the balloon is selected before the timeout
- `Failure`: the trial times out before the balloon is selected

### Metrics Shown In The App

After each technique, the app shows:

- completed trials
- successful trials
- timeout failures
- average success time
- total block time
- wrong confirms

## Study Idea

The app is intended for a small within-subject comparison.

Each participant should:

1. Complete the task with one technique
2. Complete the task with the other technique
3. Compare speed, failures, and subjective preference

The same target task is used in both conditions so the only intended difference is the interaction technique.

## Run The App

This project requires a native Android development build.

Do not use Expo Go for this app.

### Run On Android

Connect an Android phone with USB debugging enabled, then run:

```bash
npx expo run:android
```

After the dev build is installed once, you can start Metro again with:

```bash
npx expo start --dev-client
```

## Notes

- AR tracking needs a short moment to initialize when the AR screen starts
- If the app crashes in the AR view, restarting the dev client or Metro may be necessary
- Results are currently stored only for the active app session and can be noted down manually during participant testing
