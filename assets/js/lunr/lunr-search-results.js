var searchTranslations = Object.create(null);
for (var storeIndex = 0; storeIndex < store.length; storeIndex++) {
  var entry = store[storeIndex];
  if (!entry.lang_ref) continue;
  if (!searchTranslations[entry.lang_ref]) {
    searchTranslations[entry.lang_ref] = {};
  }
  searchTranslations[entry.lang_ref][entry.lang === 'ko' ? 'ko' : 'en'] = entry;
}

function selectSearchResults(results) {
  var lang = localStorage.getItem('site-lang') === 'ko' ? 'ko' : 'en';
  var selected = [];
  var seen = Object.create(null);

  for (var i = 0; i < results.length; i++) {
    var entry = store[results[i].ref];
    if (!entry.lang_ref) {
      selected.push(entry);
      continue;
    }
    if (seen[entry.lang_ref]) continue;
    seen[entry.lang_ref] = true;
    selected.push(searchTranslations[entry.lang_ref][lang] || entry);
  }

  return selected;
}

$(function() {
  var form = $('.search-content__form');
  var input = form.find('input#search');
  var clearButton = form.find('.search-clear');

  function updateClearButton() {
    clearButton.prop('hidden', !input.val());
  }

  input.on('input', updateClearButton);
  form.on('submit', function(event) {
    event.preventDefault();
    input[0].blur();
  });
  input.on('search', function() {
    input[0].blur();
  });
  clearButton.on('click', function(event) {
    event.preventDefault();
    input.focus().val('').trigger('input');
  });
  updateClearButton();
});

function renderSearchResult(post) {
  var item = $('<div class="post__item"></div>');
  var article = $('<article class="archive__item" itemscope itemtype="https://schema.org/CreativeWork"></article>');

  if (post.teaser) {
    article.append(
      $('<div class="archive__item-teaser_leftOfText"></div>').append(
        $('<img alt="">').attr('src', post.teaser)
      )
    );
  }

  var title = post.prefix ? '[' + post.prefix + '] ' + post.title : post.title;
  article.append(
    $('<h2 class="archive__item-title no_toc" itemprop="headline"></h2>').append(
      $('<a rel="permalink"></a>').attr('href', post.url).text(title)
    )
  );

  if (post.show_date && post.date) {
    article.append(
      $('<p class="page__meta"></p>').append(
        $('<span class="page__meta-date"></span>').append(
          '<i class="far fa-calendar-alt" aria-hidden="true"></i> ',
          $('<time></time>').attr('datetime', post.date_iso).text(post.date)
        )
      )
    );
  }

  if (post.display_excerpt) {
    article.append(
      $('<p class="archive__item-excerpt" itemprop="description"></p>').text(post.display_excerpt)
    );
  }

  article.append('<div class="clear"></div>');
  return item.append(article);
}
