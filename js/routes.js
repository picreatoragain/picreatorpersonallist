import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import Pemonlist from './pages/Pemonlist.js';

export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/pemonlist', component: Pemonlist },
    { path: '/roulette', component: Roulette },
];
