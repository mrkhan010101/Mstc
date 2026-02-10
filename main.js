import { CheerioCrawler, log, RequestQueue } from 'crawlee';
import { Actor } from 'apify';

await Actor.init();

const input = await Actor.getInput();
const { startUrl, keywords, maxDepth } = input;

const requestQueue = await RequestQueue.open();

await requestQueue.addRequest({ url: startUrl, userData: { depth: 0 } });

const crawler = new CheerioCrawler({

    requestQueue,

    maxRequestsPerMinute: 60,

    async requestHandler({ request, $, body, contentType, enqueueLinks }) {

        const depth = request.userData.depth;

        log.info(`Scanning: ${request.url}`);

        if (contentType?.includes("application/pdf")) {
            const filename = request.url.split("/").pop() || "download.pdf";
            await Actor.setValue(filename, body, { contentType: "application/pdf" });
            log.info(`Downloaded PDF: ${filename}`);
            return;
        }

        const anchorTags = $("a");

        anchorTags.each((i, el) => {
            const text = $(el).text().trim();
            const href = $(el).attr("href") || "";
            const onclick = $(el).attr("onclick") || "";
            const combined = `${text} ${href} ${onclick}`.toLowerCase();

            const found = keywords.some(k => combined.includes(k.toLowerCase()));

            if (found) {
                let targetUrl = href;

                if (targetUrl.startsWith("/"))
                    targetUrl = new URL(targetUrl, request.url).href;

                if (!targetUrl.startsWith("http"))
                    targetUrl = new URL(targetUrl, request.url).href;

                log.warning(`Matched Keyword → ${text}`);
                log.info(`→ Enqueuing: ${targetUrl}`);

                requestQueue.addRequest({
                    url: targetUrl,
                    userData: { depth: depth + 1 }
                });
            }
        });

        if (depth < maxDepth) {
            await enqueueLinks({
                strategy: "same-domain",
                transformRequestFunction: (req) => {
                    req.userData = { depth: depth + 1 };
                    return req;
                }
            });
        }
    },

    failedRequestHandler({ request }) {
        log.error(`Request failed: ${request.url}`);
    }
});

log.info("Starting MSTC BSNL PDF Downloader...");
await crawler.run();
await Actor.exit();
