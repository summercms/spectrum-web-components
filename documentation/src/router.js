/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { Router } from '@vaadin/router';
const githubUrl = 'https://opensource.adobe.com/spectrum-web-components/';
const baseUrl = document.location.hostname === 'opensource.adobe.com'
    ? githubUrl
    : undefined;
class DocumentationRouter extends Router {
    constructor(outlet, options) {
        super(outlet, options);
    }
    go(pathname) {
        const docs = document.querySelector('docs-page');
        docs.resetScroll();
        return Router.go(pathname);
    }
    changeParams(params) {
        if (!this.location || !this.location.route)
            return false;
        const newUrl = this.urlForPath(this.location.route.path, params);
        return this.go(newUrl);
    }
}
const docs = document.querySelector('docs-page');
export const AppRouter = new DocumentationRouter(docs, {
    baseUrl: baseUrl,
});
AppRouter.setRoutes([
    {
        path: '/',
        component: 'docs-home',
        action: async () => {
            await import('./components/home.js');
        },
    },
    {
        path: '/components/:component/:tab?',
        component: 'docs-component',
        action: async () => {
            await import('./components/component.js');
        },
    },
    {
        path: '/guides/:guide',
        component: 'docs-guide',
        action: async () => {
            await import('./components/guide.js');
        },
    },
    {
        path: '/getting-started',
        component: 'docs-guide',
        action: async () => {
            await import('./components/guide.js');
        },
    },
]);
//# sourceMappingURL=router.js.map