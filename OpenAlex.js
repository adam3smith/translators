{
	"translatorID": "432d79fe-79e1-4791-b3e1-baf700710163",
	"label": "OpenAlex",
	"creator": "Sebastian Karcher",
	"target": "^https://openalex\\.org/works",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 12,
	"browserSupport": "gcsibv",
	"lastUpdated": "2024-04-13 18:27:11"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2024 Sebastian Karcher

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


function detectWeb(doc, url) {
	if (/\/works\/w\d+/i.test(url) || /zoom=w\d+/.test(url)) {
		return 'journalArticle'; // we'll default to
	}
	else if (getSearchResults(doc, true)) {
		return 'multiple';
	}
	return false;
}

function detectSearch(item) {
	return !!item.openalex;
}

async function doSearch(item) {
	await scrape([item.openalex]);
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.v-list-item--link');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(text(row, 'div.v-list-item__title'));
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

async function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		let items = await Zotero.selectItems(getSearchResults(doc, false));
		if (!items) return;
		let ids = [];
		for (let url of Object.keys(items)) {
			ids.push(url.match(/zoom=(w\d+)/i)[1]);
		}
		await scrape(ids);
	}
	else {
		let id = url.match(/zoom=(w\d+)/i);
		if (!id) {
			id = url.match(/\/works\/(w\d+)/i);
		}
		await scrape([id[1]]);
	}
}


async function scrape(ids) {
	let apiURL = `https://api.openalex.org/works?filter=openalex:${ids.join("|")}`;
	// Z.debug(apiURL);
	let apiJSON = await requestText(apiURL);
	let translator = Zotero.loadTranslator('import');
	translator.setTranslator('faa53754-fb55-4658-9094-ae8a7e0409a2'); // OpenAlex JSON
	translator.setString(apiJSON);
	translator.setHandler('itemDone', (_obj, item) => {
		item.complete();
	});
	await translator.translate();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://openalex.org/works?page=1&filter=default.search%3Alabor&sort=relevance_score%3Adesc",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://openalex.org/works/w2029394297",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Male-Female Wage Differentials in Urban Labor Markets",
				"creators": [
					{
						"firstName": "Ronald L.",
						"lastName": "Oaxaca",
						"creatorType": "author"
					}
				],
				"date": "1973-10-01",
				"DOI": "10.2307/2525981",
				"ISSN": "0020-6598,1468-2354",
				"extra": "OpenAlex: https://openalex.org/W2029394297",
				"issue": "3",
				"language": "en",
				"libraryCatalog": "OpenAlex",
				"pages": "693",
				"publicationTitle": "International economic review",
				"volume": "14",
				"attachments": [
					{
						"title": "Submitted Version PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "labor"
					},
					{
						"tag": "male-female"
					},
					{
						"tag": "markets"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://openalex.org/works?page=1&filter=default.search%3Atest&sort=relevance_score%3Adesc&zoom=w2159306398",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Coefficient alpha and the internal structure of tests",
				"creators": [
					{
						"firstName": "Lee J.",
						"lastName": "Cronbach",
						"creatorType": "author"
					}
				],
				"date": "1951-09-01",
				"DOI": "10.1007/bf02310555",
				"ISSN": "0033-3123,1860-0980",
				"extra": "OpenAlex: https://openalex.org/W2159306398",
				"issue": "3",
				"language": "en",
				"libraryCatalog": "OpenAlex",
				"pages": "297-334",
				"publicationTitle": "Psychometrika",
				"volume": "16",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Reliability Estimation"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "search",
		"input": {
			"openalex": "W2741809807"
		},
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The state of OA: a large-scale analysis of the prevalence and impact of Open Access articles",
				"creators": [
					{
						"firstName": "Heather",
						"lastName": "Piwowar",
						"creatorType": "author"
					},
					{
						"firstName": "Jason",
						"lastName": "Priem",
						"creatorType": "author"
					},
					{
						"firstName": "Vincent",
						"lastName": "Larivière",
						"creatorType": "author"
					},
					{
						"firstName": "Juan Pablo",
						"lastName": "Alperín",
						"creatorType": "author"
					},
					{
						"firstName": "Lisa",
						"lastName": "Matthias",
						"creatorType": "author"
					},
					{
						"firstName": "Bree",
						"lastName": "Norlander",
						"creatorType": "author"
					},
					{
						"firstName": "Ashley",
						"lastName": "Farley",
						"creatorType": "author"
					},
					{
						"firstName": "Jevin D.",
						"lastName": "West",
						"creatorType": "author"
					},
					{
						"firstName": "Stefanie",
						"lastName": "Haustein",
						"creatorType": "author"
					}
				],
				"date": "2018-02-13",
				"DOI": "10.7717/peerj.4375",
				"ISSN": "2167-8359",
				"extra": "OpenAlex: https://openalex.org/W2741809807",
				"language": "en",
				"libraryCatalog": "OpenAlex",
				"pages": "e4375",
				"publicationTitle": "PeerJ",
				"shortTitle": "The state of OA",
				"volume": "6",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "access"
					},
					{
						"tag": "articles"
					},
					{
						"tag": "large-scale"
					},
					{
						"tag": "oa"
					},
					{
						"tag": "open"
					},
					{
						"tag": "prevalence"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
