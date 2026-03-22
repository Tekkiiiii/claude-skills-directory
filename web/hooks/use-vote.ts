import { useState, useCallback } from 'react';

export function useVote(skillId: string, initialVotesUp = 0, initialVotesDown = 0) {
  const [votesUp, setVotesUp] = useState(initialVotesUp);
  const [votesDown, setVotesDown] = useState(initialVotesDown);
  const [myVote, setMyVote] = useState<0 | 1 | -1>(0);
  const [loading, setLoading] = useState(false);

  const getVisitorId = () => {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('visitor_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('visitor_id', id);
    }
    return id;
  };

  const submitVote = useCallback(
    async (value: 1 | -1) => {
      if (loading) return;
      setLoading(true);

      // Optimistic update
      const prevMyVote = myVote;
      const prevVotesUp = votesUp;
      const prevVotesDown = votesDown;

      if (myVote === value) {
        // Toggle off
        setMyVote(0);
        setVotesUp((v) => (value === 1 ? v - 1 : v));
        setVotesDown((v) => (value === -1 ? v - 1 : v));
      } else {
        // Change or new vote
        if (myVote === 1) setVotesUp((v) => v - 1);
        if (myVote === -1) setVotesDown((v) => v - 1);
        setMyVote(value as 1 | -1);
        setVotesUp((v) => v + (value === 1 ? 1 : 0));
        setVotesDown((v) => v + (value === -1 ? 1 : 0));
      }

      try {
        const visitorId = getVisitorId();
        const res = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skill_id: skillId, visitor_id: visitorId, vote: value }),
        });

        if (!res.ok) {
          // Revert
          setMyVote(prevMyVote);
          setVotesUp(prevVotesUp);
          setVotesDown(prevVotesDown);
        }
      } catch {
        // Revert on error
        setMyVote(prevMyVote);
        setVotesUp(prevVotesUp);
        setVotesDown(prevVotesDown);
      } finally {
        setLoading(false);
      }
    },
    [skillId, myVote, votesUp, votesDown, loading]
  );

  return {
    votesUp,
    votesDown,
    score: votesUp - votesDown,
    myVote,
    submitVote,
    loading,
  };
}
