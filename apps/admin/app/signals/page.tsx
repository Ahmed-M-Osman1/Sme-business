import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import {SignalsTabs} from './signals-tabs';
import type {ExternalSignal, MidtermTrigger, PeerBenchmark, CommsSequence} from '@shory/db';

function unwrapData<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === 'object' && 'data' in res) return (res as {data: T[]}).data;
  return [];
}

export default async function SignalsPage() {
  const session = await auth();
  const token = session?.user?.email ?? '';

  let signals: ExternalSignal[] = [];
  let triggers: MidtermTrigger[] = [];
  let benchmarks: PeerBenchmark[] = [];
  let scheduledComms: CommsSequence[] = [];

  try {
    const [signalsRes, triggersRes, benchmarksRes, commsRes] = await Promise.all([
      adminApi.intelligence.signals(token),
      adminApi.intelligence.midterm(token),
      adminApi.intelligence.benchmarks(token),
      adminApi.intelligence.scheduledComms(token),
    ]);
    signals = unwrapData<ExternalSignal>(signalsRes);
    triggers = unwrapData<MidtermTrigger>(triggersRes);
    benchmarks = unwrapData<PeerBenchmark>(benchmarksRes);
    scheduledComms = unwrapData<CommsSequence>(commsRes);
  } catch {
    // API might not be running — show empty state
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Proactive Intelligence</h2>
      <SignalsTabs
        signals={signals}
        triggers={triggers}
        benchmarks={benchmarks}
        scheduledComms={scheduledComms}
      />
    </div>
  );
}
