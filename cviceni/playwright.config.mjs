import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'**/browser.spec.mjs',workers:1,use:{viewport:{width:1440,height:1000},headless:true},timeout:45000,reporter:'list'});
