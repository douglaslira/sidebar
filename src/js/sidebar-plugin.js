(function ($) {
	'use strict';

	var methods;
	methods = {
		renderTemplate: function (props) {
			return function (tok, i) {
				return i % 2 ? $.trim(props[tok]) : $.trim(tok);
			};
		},
		replaceTemplate: function (template) {
			return template.replace(/(\r\n|\n|\r|\t)/gm, '').split(/\#\{(.+?)\}/g);
		},
		create: function (data, element, template, options) {
			var self = this;
			$.each(data, function (index, menu) {
				if (menu.divider) {
					element.append(options.template.divider);
				} else {
					var params = {
						...menu,
						target: menu.link.target,
						url: menu.link.url === '#' ? 'javascript:void(0)' : menu.link.url
					};
					var itemTpl = self.replaceTemplate(template);
					var item = $(itemTpl.map(self.renderTemplate(params)).join(''));
					if (menu.subitems && menu.subitems.length) {
						var submenu = $('<ul></ul>');
						item.append(submenu).ready(function () {
							self.create(menu.subitems, submenu, options.template.submenu, options);
						});
					}
					element.append(item);
				}
			});
		},
		init: function (element, options) {
			var self = this;
			if (options.data && options.data.length) {
				var main = $('<ul>');
				element.append(main).ready(function () {
					self.create(options.data, main, options.template.menu, options);
				});
			}
			element.addClass('sidebar-menu');
			element.find('ul:first').addClass('sidebar-menu__list--root').addClass('sidebar-menu__list--active');
			setTimeout(function () {
				element.find('ul').addClass('sidebar-menu__list');
				element.find('li').addClass('sidebar-menu__item');
				element.find('a').addClass('sidebar-menu__link');
				// --- 01
				$('.sidebar-menu__item').each(function (index) {
					var title;
					title = $(this).children('.sidebar-menu__link').text();
					$(this).attr('data-id', index);
					if (options.ellipse) {
						$(this).children('.sidebar-menu__link').addClass('sidebar-menu__link--over').attr('title', title);
					}
					if ($(this).find('.sidebar-menu__list').length > 0) {
						var level = $(this).parents('ul').length;
						$(this).children('.sidebar-menu__link').addClass('sidebar-menu__link--parent').next('ul').attr('data-level', level);
					}
				});
				// --- 02
				$('.sidebar-menu__list').each(function () {
					var backItemElement, backLinkElement, url, level, title;
					level = $(this).data('level');
					title = $(this).prev().text();
					if (!$(this).hasClass('sidebar-menu__list--root')) {
						backItemElement = $('<li>', {
							class: 'sidebar-menu__item'
						});
						backLinkElement = $('<a>', {
							class: 'sidebar-menu__link sidebar-menu__link--back',
							style: 'padding-left: 30px',
							title: `${title}`,
							href: '#',
							html: options.title ? `&nbsp;&nbsp;${title}` : '&nbsp;'
						});
						if (level > 1) {
							if (options.ellipse) {
								backLinkElement.addClass('sidebar-menu__link--over');
							}
							backItemElement.append(backLinkElement);
							$(this).prepend(backItemElement);
						}
					}
				});
				// --- 03
				element.find('.sidebar-menu__link').click(function (event) {
					var item, link, list, parent, sub, level, check, position, scroll, backbutton;
					link = $(this);
					item = link.closest('.sidebar-menu__item');
					list = item.closest('.sidebar-menu__list');
					parent = list.closest('.sidebar-menu__item');
					sub = item.children('.sidebar-menu__list');
					level = sub.data('level');
					backbutton = sub.parent('.sidebar-menu__item').find('.sidebar-menu__link--back:first');

					if (sub.is(':visible')) {
						sub.removeClass('sidebar-menu__list--active');
					} else {
						if (link.hasClass('sidebar-menu__link--back')) {
							event.preventDefault();
							list.removeClass('sidebar-menu__list--active');
							parent.removeClass('sidebar-menu__item--opened');
							parent.find('.sidebar-menu__link').removeClass('sidebar-menu__link--hidden');
							parent.closest('.sidebar-menu__list').children('.sidebar-menu__item').removeClass('sidebar-menu__item--hidden');
							check = parent.closest('.sidebar-menu__list').children('.sidebar-menu__item:visible').length;
							if (check > 10) {
								parent.closest('.sidebar-menu__list').addClass('sidebar-menu__list--scroll');
							}
						} else {
							if (item.children('.sidebar-menu__list').length === 0) {
								return true;
							} else {
								event.preventDefault();
								parent.addClass('sidebar-menu__item--opened');
								sub.addClass('sidebar-menu__list--active').css({
									backgroundColor: '#EFEFEF'
								});
								check = sub.find('.sidebar-menu__item:visible').length;
								if (level > 1) {
									link.addClass('sidebar-menu__link--hidden');
									if (check > 5) {
										sub.prev().closest('.sidebar-menu__list--active').removeClass('sidebar-menu__list--scroll');
										sub.addClass('sidebar-menu__list--scroll');
										// SCROLL
										position = sub.offset().top;
										sub.scroll(function () {
											scroll = sub.scrollTop();
											if (scroll > 5) {
												backbutton.css({
													position: 'fixed',
													zIndex: 10000,
													backgroundColor: '#EFEFEF',
													width: '142px',
													borderBottom: '1px solid #919191'
													//'-webkit-box-shadow': '0px 10px 10px -10px #000000',
													//boxShadow: '0px 10px 10px -10px #000000'
												});
											} else {
												backbutton.css({
													position: 'static'
												});
											}
										});
									}
								} else {
									if (check > 5) {
										sub.prev().closest('.sidebar-menu__list--active').removeClass('sidebar-menu__list--scroll');
										sub.addClass('sidebar-menu__list--scroll');
									}
								}
								$(list.children('.sidebar-menu__item')).each(function () {
									if ($(this).data('id') !== item.data('id')) {
										if (level > 1) {
											$(this).addClass('sidebar-menu__item--hidden');
										}
									}
								});
							}
						}
					}
				});
			}, 100);
		}
	};

	jQuery.fn.sidebarMenu = function (options) {
		var self = this;
		options = $.extend(
			{
				title: true,
				scroll: true,
				ellipse: true,
				data: null,
				template: {
					divider: `<hr>`,
					menu: `
					<li>
						<a href="#{url}" target="#{target}" title="#{tooltiptext}">
							<i class="#{icon}"></i> #{title}
						</a>
					</li>
					`,
					submenu: `
					<li>
						<a href="#{url}" title="#{tooltiptext}" target="#{target}"><i class="#{icon}"></i> #{title}</a>
					</li>
				`
				}
			},
			options
		);
		methods.init(this, options);
		return {
			reset: function (element) {
				$(element).find('.sidebar-menu').removeClass('sidebar-menu--active');
				$(element).find('.sidebar-menu__list').removeClass('sidebar-menu__list--active');
				$(element).find('.sidebar-menu__item').removeClass('sidebar-menu__item--hidden').removeClass('sidebar-menu__item--opened');
				$(element).find('.sidebar-menu__link').removeClass('sidebar-menu__link--hidden');
				$(element).find('.sidebar-menu__list--root').addClass('sidebar-menu__list--active');
			}
		};
	};
})(jQuery);
