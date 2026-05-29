---
layout: none
---

var idx = lunr(function () {
  this.field('title')
  this.field('excerpt')
  this.field('categories')
  this.field('tags')
  this.ref('id')

  this.pipeline.remove(lunr.trimmer)

  for (var item in store) {
    this.add({
      title: store[item].title,
      excerpt: store[item].excerpt,
      categories: store[item].categories,
      tags: store[item].tags,
      id: item
    })
  }
});

// Build lang_ref lookup maps from the full store
var _langMap = {};  // lang_ref -> { ko: storeIndex, en: storeIndex }
for (var i in store) {
  var entry = store[i];
  if (!entry.lang_ref) continue;
  if (!_langMap[entry.lang_ref]) _langMap[entry.lang_ref] = {};
  if (entry.lang === 'ko') {
    _langMap[entry.lang_ref].ko = i;
  } else {
    _langMap[entry.lang_ref].en = i;
  }
}

$(document).ready(function() {
  $('input#search').on('keyup', function () {
    var resultdiv = $('#results');
    var query = $(this).val().toLowerCase();
    var result =
      idx.query(function (q) {
        query.split(lunr.tokenizer.separator).forEach(function (term) {
          q.term(term, { boost: 100 })
          if(query.lastIndexOf(" ") != query.length-1){
            q.term(term, {  usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 })
          }
          if (term != ""){
            q.term(term, {  usePipeline: false, editDistance: 1, boost: 1 })
          }
        })
      });

    // Filter and swap results based on language setting
    var currentLang = localStorage.getItem('site-lang') || 'en';
    var filtered = [];
    var seen = {};  // track lang_refs already added

    for (var i in result) {
      var ref = result[i].ref;
      var entry = store[ref];
      var langRef = entry.lang_ref;

      // If this post has a translation pair
      if (langRef && _langMap[langRef]) {
        // Skip if we already added this lang_ref pair
        if (seen[langRef]) continue;
        seen[langRef] = true;

        if (currentLang === 'ko' && _langMap[langRef].ko !== undefined) {
          // Korean mode: show Korean version
          filtered.push({ ref: _langMap[langRef].ko, score: result[i].score });
        } else if (currentLang === 'en' && _langMap[langRef].en !== undefined) {
          // English mode: show English version
          filtered.push({ ref: _langMap[langRef].en, score: result[i].score });
        } else {
          // Fallback: show whichever version matched
          filtered.push(result[i]);
        }
      } else {
        // No translation pair — show as-is
        filtered.push(result[i]);
      }
    }

    resultdiv.empty();
    resultdiv.prepend('<h3 class="results__found">'+filtered.length+' {{ site.data.ui-text[site.locale].results_found | default: "Result(s) found" }}</h3>');
    for (var item in filtered) {
      var ref = filtered[item].ref;
      if(store[ref].teaser){
        var searchitem =
          '<div class="list__item">'+
            '<article class="search__item" itemscope itemtype="https://schema.org/CreativeWork">'+
              '<div class="search__item-teaser_leftOfText">'+
                '<img src="'+store[ref].teaser+'" alt="">'+
              '</div>'+
              '<h2 class="search__item-title" itemprop="headline">'+
                '<a href="'+store[ref].url+'" rel="permalink">'+store[ref].title+'</a>'+
              '</h2>'+
              '<p class="search__item-excerpt" itemprop="description">'+store[ref].excerpt.split(" ").splice(0,200).join(" ")+'...</p>'+
            '</article>'+
          '</div>';
      }
      else{
    	  var searchitem =
          '<div class="list__item">'+
            '<article class="search__item" itemscope itemtype="https://schema.org/CreativeWork">'+
              '<h2 class="search__item-title" itemprop="headline">'+
                '<a href="'+store[ref].url+'" rel="permalink">'+store[ref].title+'</a>'+
              '</h2>'+
              '<p class="search__item-excerpt" itemprop="description">'+store[ref].excerpt.split(" ").splice(0,20).join(" ")+'...</p>'+
            '</article>'+
          '</div>';
      }
      resultdiv.append(searchitem);
    }
  });
});
