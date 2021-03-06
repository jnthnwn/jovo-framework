import { I18Next } from 'jovo-cms-i18next';
import {
	BaseApp,
    Handler,
    HandleRequest,
    Log,
    Plugin,
    PluginConfig,
} from 'jovo-core';

import _merge = require('lodash.merge');
import * as path from 'path';

export interface Config extends PluginConfig {
	intentMap?: {
		[key: string]: string;
	};
}

export interface Response {
	status: 'SUCCESSFUL' | 'REJECTED' | 'ERROR';
	data: {
		[key: string]: any; // tslint:disable-line
	};
}

export class Component implements Plugin {
	config: Config = {};
	handler: Handler = {};
	pathToI18n?: string; // path to dir containing i18n files
	name?: string;
	$response?: Response;
	stateBeforeDelegate?: string; // Used to route the app back to the state where it left off after the component is done.
	onCompletedIntent?: string; // intent to which the component routes to, when it sends out response
	i18next?: I18Next;

	constructor(config?: Config) {
		if (config) {
			this.config = _merge(this.config, config);
		}
	}

	install(app: BaseApp) {
		// load components i18n files before setup as in setup the i18n object is initialized
		app.middleware('before.setup')!.use(this.loadI18nFiles.bind(this));
		app.middleware('after.platform.init')!.use(this.initialize.bind(this));

		this.i18next = new I18Next();
	}

	/**
	 * Adds the components i18n files to the $cms.I18Next object
	 * @param handleRequest
	 */
	async loadI18nFiles(handleRequest: HandleRequest) {
		const pathToComponent = `../components/${this.name}/`;
		const filesDir = path
			.join(pathToComponent, this.pathToI18n || '')
			.replace(new RegExp('\\' + path.sep, 'g'), '/');
		this.i18next!.config.filesDir = filesDir;

		this.i18next!.loadFiles(handleRequest);
	}

	/**
	 * Adds a reference to a specific component inside the $components object
	 * @param handleRequest
	 */
	initialize(handleRequest: HandleRequest) {
		if (!handleRequest.jovo!.$components) {
			handleRequest.jovo!.$components = {};
		}

		handleRequest.jovo!.$components[this.name!] = this;
	}

	/**
	 * Merges the component's default config with the config defined in the project's main config.js file,
	 * and saves it inside components `config` property
	 * @param {Config} appConfig config defined in project's main config.js file
	 */
	mergeConfig(appConfig: Config): Config {
		const mergedComponentConfig = _merge(this.config, appConfig);

		return mergedComponentConfig;
	}
}
