#!/usr/bin/env node

require('effortless-require')();
const [meow, console, cachios, ora] = need('meow', 'Console', 'cachios', 'ora');

const cli = meow(`
	Usage
	  $ mail-test <email address>
	Example
	  $ mail-test bharathvaj@zoho.com
	  This domain is active and is set up to receive emails normally.
`);
console.debug(`
8""8""8 8""""8 8  8       ""8"" 8"""" 8""""8 ""8""
8  8  8 8    8 8  8         8   8     8        8  
8e 8  8 8eeee8 8e 8e        8e  8eeee 8eeeee   8e 
88 8  8 88   8 88 88        88  88        88   88 
88 8  8 88   8 88 88        88  88    e   88   88 
88 8  8 88   8 88 88eee     88  88eee 8eee88   88 `);
if (cli.input.length === 0) {
	console.warn('Please specify a email address');
	process.exit(1);
}

const mailTest = {
	/* 
    * Contruct URL from the domain name
    */
	_buildUrl(domainName) {
		return `http://api.mailtest.in/v1/${domainName}`;
	},
	/* 
	* Makes actual request to the Mail Test server
	*/
	_checkDomain(url) {
		return cachios
			.get(url, {
				ttl: 60
			})
			.then(response => {
				return response.data;
			});
	},
	/* 
	* Validates the user cli input
	*/
	validate(emailId) {
		if (!emailId && typeof emailId !== 'string') {
			console.warn('Please specify a email address');
			process.exit(1);
		}
		const domainName = emailId.split('@')[1];
		if (!domainName) {
			console.error('Please specify a valid email address');
			process.exit(1);
		}
		const spinner = ora({
			color: 'blue',
			text: 'Validating',
			spinner: {
				interval: 80,
				frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
			}
		}).start();
		const url = this._buildUrl(domainName);
		this._checkDomain(url)
			.then(domainDetails => {
				if (domainDetails) {
					spinner.stop();
					switch (domainDetails.status) {
						case 'ACTIVE':
							console.success('This domain is active and is set up to receive emails normally.');
							break;
						case 'DISPOSABLE':
							console.warn(
								'This domain operates an anonymous, temporary or disposable email service (DEA). It is likely this inbox will only exist for a few minutes or hours.'
							);
							break;
						case 'ROBOT':
							console.warn(
								'This domain runs a monetized bounce service. Emails sent to this address will not be read by a human.'
							);
							break;
						case 'INVALID':
							console.warn('This domain is not setup to accept emails and any messages sent to it will bounce.');
							break;
						case 'UNKNOWN':
							console.warn(
								'MailTest has encountered a problem investigating this domain and cannot give a definitive answer at this time. How you handle this response depends on your use case but you may wish to treat the response as if it were active and optionally re-test at a later time.'
							);
							break;
						default:
							console.error(`Hmm... That doesn't sounds good...`);
							break;
					}
				} else {
					console.error(`Ah... Program forgot the response on the way to your computer...`);
					process.exit(1);
				}
			})
			.catch(err => {
				console.error('Oops!... MailTest had gone rogue.');
			});
	}
};

mailTest.validate(cli.input[0]);
