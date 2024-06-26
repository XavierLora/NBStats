const EleventyVitePlugin = require("@11ty/eleventy-plugin-vite");

module.exports = function(eleventyConfig) {

    eleventyConfig.addPlugin(EleventyVitePlugin);
    eleventyConfig.addPassthroughCopy("src/assets/");
    eleventyConfig.addPassthroughCopy("src/_includes/");
    eleventyConfig.addPassthroughCopy("src/index.js");
    eleventyConfig.addPassthroughCopy("src/live/live.js");
    eleventyConfig.addPassthroughCopy("src/stats/statsEast.js");
    eleventyConfig.addPassthroughCopy("src/stats/statsWest.js");
    eleventyConfig.addPassthroughCopy("src/blog/posts/");

    eleventyConfig.addCollection('posts', function(collectionApi){
        return collectionApi.getFilteredByGlob('src/blog/posts/*.md');
    })
    return{
        dir: {
            input: 'src',
            includes: '_includes',
            output: '_site',
        },
        templateFormats: ['md', 'njk', 'html'],
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        dataTemplateEngine: 'njk',
    };
}