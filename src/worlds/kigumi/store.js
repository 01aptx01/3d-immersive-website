import { create } from 'zustand';

export const ASSEMBLY_STAGES = [
  { id: 'foundation', title: 'Foundation stones', subtitle: 'A level base', kicker: 'GROUNDWORK', description: 'A low stone footing establishes the pavilion footprint above the garden floor.' },
  { id: 'pillars', title: 'Pillars', subtitle: 'Six timber posts', kicker: 'UPRIGHTS', description: 'Six square timber posts rise from the stone supports to carry the surrounding frame.' },
  { id: 'beams', title: 'Beams', subtitle: 'The top frame', kicker: 'FRAME', description: 'Longitudinal and crosswise beams meet above the posts to form the pavilion frame.' },
  { id: 'joints', title: 'Interlocking joints', subtitle: 'Tenons and locks', kicker: 'CONNECTIONS', description: 'The model exposes tenon-like extensions and cross locks at selected beam-to-post connections.' },
  { id: 'rafters', title: 'Rafters', subtitle: 'Roof structure', kicker: 'ROOF FRAME', description: 'Rafters span outward from the raised ridge and define the broad hipped roof.' },
  { id: 'tiles', title: 'Roof tiles', subtitle: 'Layered cover', kicker: 'ROOF COVER', description: 'Individual dark tiles cover the roof planes in overlapping rows.' },
  { id: 'shoji', title: 'Shoji screens', subtitle: 'Paper and timber', kicker: 'ENCLOSURE', description: 'Light framed panels complete the pavilion while leaving its central opening visible.' },
];

const JOINT_HISTORY = 'Japanese wooden architecture uses many distinct timber connections. Kiyomizu-dera’s official history describes its stage, reconstructed in 1633, with rails passing through 18 pillars to form nail-free joints. This pavilion uses a simplified through-tenon and separate cross wedge as a visual study; it is not a reconstruction of that structure or a claim that this exact joint was used there.';

export const JOINT_DETAILS = [
  { name: 'North-west through-tenon study', history: JOINT_HISTORY },
  { name: 'North-center through-tenon study', history: JOINT_HISTORY },
  { name: 'North-east through-tenon study', history: JOINT_HISTORY },
  { name: 'South-west through-tenon study', history: JOINT_HISTORY },
  { name: 'South-center through-tenon study', history: JOINT_HISTORY },
  { name: 'South-east through-tenon study', history: JOINT_HISTORY },
];

export const useKigumiStore = create((set) => ({
  stage: -1,
  furthestStage: -1,
  jointCount: 0,
  selectedJoint: -1,
  jointRunId: 0,
  jointMode: 'assemble',
  jointPhase: 'Ready',
  jointAnimating: false,
  jointInfoOpen: false,
  soundEnabled: false,
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setStage: (stage) => set((state) => state.jointAnimating ? state : ({ stage: Math.max(-1, Math.min(state.furthestStage, stage)) })),
  advanceAssembly: () => set((state) => {
    if (state.jointAnimating || state.stage >= ASSEMBLY_STAGES.length - 1) return state;
    if (state.stage === 3 && state.jointCount < 6) {
      return { selectedJoint: state.jointCount, jointRunId: state.jointRunId + 1, jointMode: 'assemble', jointPhase: 'Focus', jointAnimating: true, jointInfoOpen: true };
    }
    const nextStage = state.stage + 1;
    return { stage: nextStage, furthestStage: Math.max(state.furthestStage, nextStage), jointInfoOpen: false };
  }),
  beginJointReplay: (joint) => set((state) => {
    if (state.jointAnimating || joint < 0 || joint >= state.jointCount) return state;
    return { selectedJoint: joint, jointRunId: state.jointRunId + 1, jointMode: 'replay', jointPhase: 'Focus', jointAnimating: true, jointInfoOpen: true };
  }),
  setJointPhase: (jointPhase) => set({ jointPhase }),
  finishJoint: () => set((state) => ({
    jointCount: state.jointMode === 'assemble' ? Math.min(6, state.jointCount + 1) : state.jointCount,
    jointAnimating: false,
    jointPhase: 'Locked',
    furthestStage: state.jointMode === 'assemble' && state.jointCount === 5 ? Math.max(state.furthestStage, 3) : state.furthestStage,
  })),
  cancelJointAnimation: () => set((state) => state.jointAnimating ? ({
    selectedJoint: -1,
    jointRunId: state.jointRunId + 1,
    jointMode: 'assemble',
    jointPhase: 'Ready',
    jointAnimating: false,
    jointInfoOpen: false,
  }) : state),
  closeJointInfo: () => set({ jointInfoOpen: false }),
}));
