import { useState, useEffect } from 'react';
import React from "react";
import './Dashboard.css';
import { createSearchParams, useSearchParams, useNavigate } from "react-router-dom";
import { handleUserDashBoardApi } from '../Services/dashboardService';
import { getUserChallenges } from '../Services/challengeService';
import { setUserData } from '../Utils/userData';
import Navbar from './NavBar';

const CARDS = [
  { label: 'Edit Profile',    path: '/UpdateProfile' },
  { label: 'Friends List',    path: '/FriendsList' },
  { label: 'Find Friends',    path: '/FriendSearch' },
  { label: 'Call',            path: '/Videocall' },
  { label: 'Translator',      path: '/Translator' },
  { label: 'User Report',     path: '/UserReport' },
  { label: 'Scheduler',       path: '/Scheduler' },
  { label: 'Chat Assistant',  path: '/Assistant' },
  { label: 'Transcripts',     path: '/TranscriptView' },
  { label: 'Games',           path: '/GameSelection' },
  { label: 'Challenges',      path: '/Challenges' },
  { label: 'Teams',           path: '/TeamLobby' },
];

function Dashboard() {
  const [search] = useSearchParams();
  const id = search.get("id");
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pendingChallenges, setPendingChallenges] = useState(0);
  const [yourTurnChallenges, setYourTurnChallenges] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await handleUserDashBoardApi(id);
        setFirstName(data.user.firstName);
        setLastName(data.user.lastName);
        setUserData({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
        });
      } catch (err) {
        console.log(err);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchChallenges = async () => {
      try {
        const res = await getUserChallenges(id);
        const list = res?.challenges || res?.data?.challenges || [];
        if (!Array.isArray(list)) return;
        const pending = list.filter((c) => c.status === 'pending' && Number(c.challengedId) === Number(id)).length;
        const yourTurn = list.filter((c) => {
          if (!['accepted', 'in_progress'].includes(c.status)) return false;
          if (Number(c.challengerId) === Number(id)) return c.challengerScore === null;
          if (Number(c.challengedId) === Number(id)) return c.challengedScore === null;
          return false;
        }).length;
        setPendingChallenges(pending);
        setYourTurnChallenges(yourTurn);
      } catch {
        setPendingChallenges(0);
        setYourTurnChallenges(0);
      }
    };
    fetchChallenges();
    const interval = setInterval(fetchChallenges, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const goTo = (path) => {
    navigate({ pathname: path, search: createSearchParams({ id }).toString() });
  };

  return (
    <div className="dashboard-page">
      <Navbar id={id} />

      {pendingChallenges > 0 && (
        <div className="dash-challenge-banner dash-challenge-banner-pending">
          <span>You have {pendingChallenges} pending challenge{pendingChallenges !== 1 ? 's' : ''} waiting for your response.</span>
          <button className="dash-challenge-banner-btn" onClick={() => goTo('/Challenges')}>View Challenges</button>
        </div>
      )}
      {yourTurnChallenges > 0 && pendingChallenges === 0 && (
        <div className="dash-challenge-banner dash-challenge-banner-turn">
          <span>It&apos;s your turn to play in {yourTurnChallenges} challenge{yourTurnChallenges !== 1 ? 's' : ''}!</span>
          <button className="dash-challenge-banner-btn" onClick={() => goTo('/Challenges')}>Play Now</button>
        </div>
      )}

      <div className="dashboard-welcome">
        <h1>Welcome, {firstName} {lastName}</h1>
        <p>What would you like to do today?</p>
      </div>

      <div className="dashboard-grid">
        {CARDS.map((card) => (
          <div key={card.path} className="dash-card" onClick={() => goTo(card.path)}>
            <span className="dash-card-label">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-footer">
        <button
          className="dash-logout-btn"
          onClick={() => goTo('/LogoutConfirmation')}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
