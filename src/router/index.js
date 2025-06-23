import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import TreeDetails from '../views/TreeDetails.vue';

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/tree/:id', name: 'TreeDetails', component: TreeDetails },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;