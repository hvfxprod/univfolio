import { writeFileSync } from 'node:fs';
import { CURRENT_USER_DEFAULT, INITIAL_PROJECTS, INITIAL_JOBS, INITIAL_SCOUT_OFFERS } from '../src/data/mockData';
writeFileSync(new URL('./seed.json', import.meta.url), JSON.stringify({ projects: INITIAL_PROJECTS, jobs: INITIAL_JOBS, scouts: INITIAL_SCOUT_OFFERS, profiles: [CURRENT_USER_DEFAULT] }));
