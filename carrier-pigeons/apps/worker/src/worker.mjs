import { runSimulationLoop } from './simulator.mjs';
import { runSolanaTracker } from './solana-tracker.mjs';

const simulationMode = (process.env.SIMULATION_MODE ?? 'true').toLowerCase() === 'true';

if (simulationMode) {
  await runSimulationLoop();
} else {
  await runSolanaTracker();
  await new Promise(() => {});
}
