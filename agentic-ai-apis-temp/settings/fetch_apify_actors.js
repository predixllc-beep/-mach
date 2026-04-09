/**
 * Fetch Apify store actors and save the raw source data locally for focused
 * repo generation.
 *
 * This script intentionally stores only the raw JSON source. The tracked repo
 * README files are generated separately by generate_readme_clean.js, which
 * filters the catalog down to:
 * - Agents
 * - AI Models
 * - MCP Servers
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'api.apify.com';

function makeRequest(hostname, requestPath) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname,
            path: requestPath,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(new Error(`Failed to parse JSON: ${error.message}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function fetchAllActors(limit = 100) {
    const allActors = [];
    let offset = 0;

    console.log('Starting to fetch Apify actors...');

    while (true) {
        try {
            const requestPath = `/v2/store?limit=${limit}&offset=${offset}`;
            console.log(`Fetching actors at offset ${offset}...`);

            const data = await makeRequest(API_BASE_URL, requestPath);
            const actors = data?.data?.items || [];
            const totalCount = data?.data?.total || 0;

            if (actors.length === 0) {
                break;
            }

            for (const actor of actors) {
                const url =
                    actor.url ||
                    (actor.username && actor.name
                        ? `https://apify.com/${actor.username}/${actor.name}`
                        : '');

                allActors.push({
                    name: actor.name || 'Unknown',
                    username: actor.username || '',
                    title: actor.title || actor.name || 'Unknown',
                    description: actor.description || '',
                    url,
                    affiliate_url: url ? `${url}${url.includes('?') ? '&' : '?'}fpr=p2hrc6` : '',
                    stats: actor.stats || {},
                    categories: actor.categories || [],
                    createdAt: actor.createdAt || '',
                    modifiedAt: actor.modifiedAt || '',
                });
            }

            console.log(`Fetched ${allActors.length} actors so far... (Total available: ${totalCount})`);

            if (offset + actors.length >= totalCount) {
                break;
            }

            offset += limit;
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`Error fetching actors at offset ${offset}: ${error.message}`);
            console.log('Retrying in 5 seconds...');
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }

    return allActors;
}

function saveToJSON(actors, filename = 'apify_actors.json') {
    const filePath = path.join(__dirname, '..', filename);
    fs.writeFileSync(filePath, JSON.stringify(actors, null, 2), 'utf-8');
    console.log(`Saved ${actors.length} actors to ${filename}`);
}

async function main() {
    console.log('='.repeat(60));
    console.log('Apify Actors Fetcher');
    console.log('='.repeat(60));

    try {
        const actors = await fetchAllActors(100);

        if (actors.length === 0) {
            console.log('No actors were fetched. Please check the API connection.');
            return;
        }

        saveToJSON(actors, 'apify_actors.json');
        console.log('Done! Run settings/generate_readme_clean.js to rebuild the focused repo pages.');
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();
