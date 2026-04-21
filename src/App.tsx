/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phase, CrystallizationCardData, TensionCardData, TripProposalData, UserRole } from './types';
import { MOCK_INPUT, MOCK_CRYSTALLIZATION_CARDS, MOCK_TENSION_CARDS, MOCK_TRIPS } from './mockData';
import { TopBar } from './components/TopBar';
import { CommandBar } from './components/CommandBar';
import { PhaseIndicator } from './components/PhaseIndicator';
import { ExpressionCapture } from './components/ExpressionCapture';
import { Crystallization } from './components/Crystallization';
import { JourneyAndOutreach } from './components/JourneyAndOutreach';
import { EvaluationJourneys } from './components/EvaluationJourneys';
import { RoleSystemPreview } from './components/RoleSystemPreview';
import { Launch } from './components/Launch';
import { CommandSurface } from './components/CommandSurface';
import { GlobalSidebar } from './components/GlobalSidebar';
import { PromptLab } from './components/PromptLab';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [phase, setPhase] = useState<Phase>('EXPRESS');
  const [userRole, setUserRole] = useState<UserRole>('HM');
  const [inputText, setInputText] = useState('');
  const [cards, setCards] = useState<CrystallizationCardData[]>(MOCK_CRYSTALLIZATION_CARDS);
  const [tensions, setTensions] = useState<TensionCardData[]>(MOCK_TENSION_CARDS);
  const [trips, setTrips] = useState<TripProposalData[]>(MOCK_TRIPS);

  const isAdmin = userRole === 'HM'; // Mocking admin check based on role for now

  return (
    <div className="min-h-screen flex bg-base text-ink font-sans selection:bg-ink selection:text-base">
      <GlobalSidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {phase === 'COMMAND_SURFACE' ? (
          <CommandSurface userRole={userRole} setUserRole={setUserRole} />
        ) : (
          <>
            <TopBar phase={phase} userRole={userRole} setUserRole={setUserRole} />
            
            <main className="flex-1 flex flex-col items-center w-full overflow-y-auto px-6 py-12 relative custom-scrollbar">
              <div className="w-full max-w-5xl mx-auto">
                <PhaseIndicator currentPhase={phase} setPhase={setPhase} />
                
                <div className="w-full mt-12 mb-32">
                  {phase === 'EXPRESS' && (
                    <ExpressionCapture 
                      inputText={inputText} 
                      setInputText={setInputText} 
                      onCrystallize={() => setPhase('CRYSTALLIZE')} 
                    />
                  )}

                  {phase === 'PROMPT_LAB' && (
                    <PromptLab />
                  )}
                  
                  {phase === 'CRYSTALLIZE' && (
                    <Crystallization 
                      inputText={inputText}
                      cards={cards}
                      setCards={setCards}
                      tensions={tensions}
                      setTensions={setTensions}
                      onNext={() => setPhase('JOURNEY_OUTREACH')}
                    />
                  )}
                  
                  {phase === 'JOURNEY_OUTREACH' && (
                    <JourneyAndOutreach onNext={() => setPhase('EVALUATION_JOURNEYS')} />
                  )}
                  
                  {phase === 'EVALUATION_JOURNEYS' && (
                    <EvaluationJourneys 
                      trips={trips} 
                      setTrips={setTrips} 
                      onNext={() => setPhase('PREVIEW')} 
                    />
                  )}
                  
                  {phase === 'PREVIEW' && (
                    <RoleSystemPreview onNext={() => setPhase('LAUNCHED')} />
                  )}
                  
                  {phase === 'LAUNCHED' && (
                    <Launch onNext={() => setPhase('COMMAND_SURFACE')} />
                  )}
                </div>
              </div>
            </main>
          </>
        )}
        <CommandBar />
      </div>
    </div>
  );
}
