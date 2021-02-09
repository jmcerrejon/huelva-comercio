// const pageControl = {
//     currentPageCandidates: 1,
//     currentPageEmployments: 1,
//     lastPageCandidates: 0,
//     lastPageEmployments: 0,
// };
// const search = {
//     candidates: {
//         visible: false,
//         sectorId: '',
//         query: '',
//     },
//     employments: {
//         visible: false,
//         sectorId: '',
//         query: '',
//     },
// };
// let sectors;
// let isEmploymentsLoaded = false;

// (function constructor() {
//     $.tabbedbar.load({
//         index: 0,
//         labels: getTitlesIfAuth(),
//     });
//     if (candidateExistsRequest()) {
//         changeCandidateButtonTitle();
//     }
//     // Alloy.Globals.Api.readSectors({}, (response) => {
//     //     sectors = [...response.data];
//     //     fillPicker(sectors);
//     //     changeSectorEvent();
//     // });
// })();

// Alloy.Globals.events.on('offers', () => {
//     if (Alloy.Globals.guest) {
//         renderHeaderCandidates(false);
//         $.scrollableView.setViews([$.vwCandidates]);
//         $.scrollableView.remove($.vwEmployments);
//         return;
//     }
//     Alloy.Globals.Api.readCandidates(
//         {
//             page: 1,
//             sector_id: search['candidates'].sectorId,
//             query: search['candidates'].query,
//         },
//         (response) => {
//             if (response.data.length === 0) {
//                 renderHeaderCandidates(true);
//                 return;
//             }
//             init({
//                 model: 'candidates',
//                 currentPage: 'currentPageCandidates',
//                 lastPage: 'lastPageCandidates',
//                 response,
//                 listView: 'lvCandidates',
//                 infScrollWidget: 'isCandidate',
//             });
//         }
//     );
//     Alloy.Globals.events.off('offers');
// });

// Alloy.Globals.events.on('demmand_notification', (data) => {
//     const offerIndex = 1;
//     Alloy.Globals.offersWin.setActive(true);
//     $.tabbedbar.setIndex(offerIndex);
//     $.scrollableView.setCurrentPage(offerIndex);
//     readEmployments();
// });

// function changeCandidateButtonTitle() {
//     const item = $.lvCandidates.sections[0].getItemAt(0);
//     item.candidateButton.title =
//         Alloy.Globals.candidate !== null
//             ? 'EDITAR MI CURRÍCULUM'
//             : 'SUBIR MI CURRÍCULUM';
//     $.lvCandidates.sections[0].updateItemAt(0, item);
// }

// function renderHeaderCandidates(isAffiliated) {
//     const item = $.lvCandidates.sections[0].getItemAt(0);
//     if (isAffiliated) {
//         item.candidateButton.height = 0;
//         item.lbHeaderCandidates.text = 'No hay publicado ningún candidato';
//     }
//     $.vwSectors.height = 0;
//     item.vwNoCandidates.height = '80%';
//     $.lvCandidates.sections[0].updateItemAt(0, item);
//     OS_IOS
//         ? ($.searchBarCandidates.height = 0)
//         : ($.searchBarCandidates.visible = false);
// }

// function handleViewNoItems({
//     listview,
//     hasItems,
//     vwNoItems,
//     searchBar,
//     vwSector,
// }) {
//     const item = $[listview].sections[0].getItemAt(0);
//     if (!hasItems && listview === 'lvCandidates') {
//         item.candidateButton.height = 0;
//         item.lbHeaderCandidates.text = 'No hay publicado ningún candidato';
//     }
//     item[vwNoItems].height = !hasItems ? '80%' : 0;
//     $[vwSector].height = !hasItems ? 0 : Ti.UI.SIZE;

//     $[listview].sections[0].updateItemAt(0, item);
//     OS_IOS
//         ? ($[searchBar].height = !hasItems ? 0 : Ti.UI.SIZE)
//         : ($[searchBar].visible = hasItems);
// }

// if (OS_IOS && !Alloy.Globals.guest) {
//     $.lvCandidates.addEventListener('scrollend', listViewListener);
//     $.lvEmployments.addEventListener('scrollend', listViewListener);

//     function listViewListener(e) {
//         let key = e.source.id === 'lvCandidates' ? 'candidates' : 'employments';

//         if (e.firstVisibleItemIndex === 0) {
//             toggleSearchBar(key, e.source.id);
//         }
//     }

//     function toggleSearchBar(key, listViewId) {
//         if (listViewId === 'lvEmployments' && !isEmploymentsLoaded) {
//             return;
//         }
//         $[listViewId].setContentOffset({
//             x: 0,
//             y: search[key].visible ? 0 : 55,
//         });
//         search[key].visible = !search[key].visible;
//     }
// }

// function changeSectorEvent() {
//     $.filterSectorCandidates.on('change', (item) => {
//         pageControl.currentPageCandidates = 1;
//         search['candidates'].sectorId =
//             item.val === 'Todos los sectores' ? '' : item.val;
//         Alloy.Collections.candidates.reset();
//         myLoader({
//             model: 'candidates',
//             currentPage: 'currentPageCandidates',
//             lastPage: 'lastPageCandidates',
//         });
//     });
//     $.filterSectorEmployments.on('change', (item) => {
//         pageControl.currentPageEmployments = 1;
//         search['employments'].sectorId =
//             item.val === 'Todos los sectores' ? '' : item.val;
//         Alloy.Collections.employments.reset();
//         myLoader({
//             model: 'employments',
//             currentPage: 'currentPageEmployments',
//             lastPage: 'lastPageEmployments',
//         });
//     });
// }

// function init({
//     model,
//     currentPage,
//     lastPage,
//     response,
//     listView,
//     infScrollWidget,
// }) {
//     pageControl[lastPage] = response.last_page;
//     if (pageControl[currentPage] == 1) {
//         Alloy.Collections[model].reset();
//     }
//     Alloy.Collections[model].add(response.data);
//     pageControl[currentPage]++;
//     setTimeout(() => {
//         $[infScrollWidget].init($[listView]);
//         $[infScrollWidget].setOptions({
//             msgTap: '',
//             msgDone: '',
//             msgError: 'Toca para intentar de nuevo...',
//         });
//     }, 1000);
// }

// function getTitlesIfAuth() {
//     return !_.isNull(Alloy.Globals.user)
//         ? [{title: 'Bolsa de empleo'}, {title: 'Centro de negocio'}]
//         : [{title: 'Bolsa de empleo'}];
// }

// function myLoaderCandidates(e) {
//     myLoader({
//         model: 'candidates',
//         currentPage: 'currentPageCandidates',
//         lastPage: 'lastPageCandidates',
//         element: e,
//     });
// }

// function myLoaderEmployments(e) {
//     myLoader({
//         model: 'employments',
//         currentPage: 'currentPageEmployments',
//         lastPage: 'lastPageEmployments',
//         element: e,
//     });
// }

// function fillPicker(list, first = null) {
//     const sectors = renderSectorList(list, first);
//     $.filterSectorCandidates.loadList(sectors);
//     $.filterSectorEmployments.loadList(sectors);
// }

// function renderSectorList(sectors, firstElementName) {
//     let result = [
//         {
//             val: '',
//             value: 'Todos los sectores',
//             text: 'Todos los sectores',
//         },
//     ];
//     sectors.map((sector) => {
//         const item = {
//             val: sector.id,
//             value: sector.name,
//             text: sector.name,
//         };
//         firstElementName !== null && firstElementName === sector.name
//             ? result.unshift(item)
//             : result.push(item);
//     });

//     return result;
// }

// function myLoader({model, currentPage, lastPage, element}) {
//     Alloy.Collections[model].fetch({
//         page: pageControl[currentPage],
//         sector_id: search[model].sectorId,
//         query: search[model].query,
//         add: true,
//         success: function (collection) {
//             if (_.isUndefined(element)) {
//                 return;
//             }
//             if (pageControl[currentPage] === pageControl[lastPage]) {
//                 element.done();
//             } else {
//                 pageControl[currentPage]++;
//                 element.success();
//             }
//         },
//         error: function (col) {
//             Alloy.Globals.showMessage(
//                 'No se pueden mostrar. Inténtelo mas tarde.'
//             );
//         },
//     });
// }

// function reset(item) {
//     const index = !_.isUndefined(item.source) ? item.source.type : item;

//     if (Alloy.Globals.guest) {
//         $['refreshCandidates'].endRefreshing();
//         return;
//     }

//     if (index === 'employments' && !isEmploymentsLoaded) {
//         $['refreshEmployments'].endRefreshing();
//         return;
//     }

//     resetListView(
//         index === 'employments'
//             ? {
//                   model: 'employments',
//                   listview: 'lvEmployments',
//                   currentPage: 'currentPageEmployments',
//                   infScrollWidget: 'is',
//                   refreshControl: 'refreshEmployments',
//                   vwNoItems: 'vwNoEmployments',
//                   searchBar: 'searchBarEmployments',
//                   vwSector: 'vwSectorsEmployments',
//               }
//             : {
//                   model: 'candidates',
//                   listview: 'lvCandidates',
//                   currentPage: 'currentPageCandidates',
//                   infScrollWidget: 'isCandidate',
//                   refreshControl: 'refreshCandidates',
//                   vwNoItems: 'vwNoCandidates',
//                   searchBar: 'searchBarCandidates',
//                   vwSector: 'vwSectors',
//               }
//     );
// }

// function resetListView({
//     model,
//     listview,
//     currentPage,
//     infScrollWidget,
//     refreshControl,
//     vwNoItems,
//     searchBar,
//     vwSector,
// }) {
//     pageControl[currentPage] = 1;
//     search[model].query = '';
//     Alloy.Collections[model].fetch({
//         page: pageControl[currentPage],
//         sector_id: search[model].sectorId,
//         query: search[model].query,
//         success: (collection) => {
//             const sectorId = getSectorId(
//                 model === 'candidates'
//                     ? $.filterSectorCandidates.getValue()
//                     : $.filterSectorEmployments.getValue()
//             );

//             if (sectorId === '' && collection.length === 0) {
//                 handleViewNoItems({
//                     listview,
//                     hasItems: collection.length > 0,
//                     vwNoItems,
//                     searchBar,
//                     vwSector,
//                 });
//                 return;
//             }

//             $[infScrollWidget].load();
//             $[refreshControl].endRefreshing();
//         },
//     });
// }

// function doOpenCandidate(e) {
//     if (Alloy.Globals.guest || e.sectionIndex === 0) {
//         return;
//     }

//     openView({
//         model: 'candidates',
//         index: e.itemId,
//         path: 'employments/candidate_detail',
//     });
// }

// function doOpenEmployment(e) {
//     if (e.sectionIndex === 0) {
//         return;
//     }

//     openView({
//         model: 'employments',
//         index: e.itemId,
//         path: 'employments/employment_detail',
//     });
// }

// function openView({model, index, path}) {
//     const data = _.isUndefined(Alloy.Collections[model].get(index))
//         ? null
//         : Alloy.Collections[model].get(index).toJSON();

//     Alloy.createController(path, {
//         method:
//             Alloy.Globals.candidate === null && Alloy.Globals.guest === true
//                 ? 'POST'
//                 : 'GET',
//         data,
//         sectors,
//     })
//         .on('close', function (employ = false) {
//             if (employ.updated) {
//                 Alloy.Collections[model].reset();
//                 reset(model);
//             }
//         })
//         .getView()
//         .open();
// }

// function doAddEmployment(e) {
//     Alloy.createController('employments/employment_detail', {
//         method: 'POST',
//         sectors,
//     })
//         .getView()
//         .open();
// }

// function handlePdfDocument(e) {
//     Alloy.createController('employments/candidate_detail', {
//         method: Alloy.Globals.candidate !== null ? 'PUT' : 'POST',
//         data: Alloy.Globals.candidate,
//         sectors,
//     })
//         .on('close', function (candidate) {
//             changeCandidateButtonTitle();
//         })
//         .getView()
//         .open();
// }

// // TODO Delete the next function if not in use
// function doSearchCandidates() {
//     pageControl.currentPageCandidates = 1;
//     search['candidates'].query = $.searchSector.getValue();
//     Alloy.Collections.candidates.reset();
//     myLoader({
//         model: 'candidates',
//         currentPage: 'currentPageCandidates',
//         lastPage: 'lastPageCandidates',
//     });
// }

// function doSearchEmployment() {
//     pageControl.currentPageEmployments = 1;
//     search['employments'].query = $.searchEmployment.getValue();
//     Alloy.Collections.employments.reset();
//     myLoader({
//         model: 'employments',
//         currentPage: 'currentPageEmployments',
//         lastPage: 'lastPageEmployments',
//     });
// }

// function tabbedbarClick(e) {
//     if (isNotEmploymentsListLoaded(e.index)) {
//         readEmployments();
//     }
//     $.scrollableView.setCurrentPage(e.index);
// }

// function readEmployments() {
//     Alloy.Globals.Api.readEmployments(
//         {
//             page: 1,
//             sector_id: search['employments'].sectorId,
//             query: search['employments'].query,
//         },
//         (response) => {
//             if (response.data.length === 0) {
//                 isEmploymentsLoaded = false;
//                 renderHeaderNoEmployments();
//                 return;
//             }
//             isEmploymentsLoaded = true;
//             init({
//                 model: 'employments',
//                 currentPage: 'currentPageEmployments',
//                 lastPage: 'lastPageEmployments',
//                 response,
//                 listView: 'lvEmployments',
//                 infScrollWidget: 'is',
//             });
//         }
//     );
// }

// function renderHeaderNoEmployments() {
//     const item = $.lvEmployments.sections[0].getItemAt(0);
//     item.vwNoEmployments.height = Ti.UI.FILL;
//     $.lvEmployments.sections[0].updateItemAt(0, item);
//     $.vwSectorsEmployments.height = $.searchBarEmployments.height = 0;
// }

// function isNotEmploymentsListLoaded(index) {
//     return index === 1 && !isEmploymentsLoaded;
// }

// function doSearch(e) {
//     if (e.value.length < 3) {
//         Alloy.Globals.showMessage('Escriba al menos 3 caracteres.');
//         return;
//     }

//     e.source.type === 'candidates'
//         ? (pageControl.currentPageCandidates = 1)
//         : (pageControl.currentPageEmployments = 1);

//     const sectorId = getSectorId(
//         e.source.type === 'candidates'
//             ? $.filterSectorCandidates.getValue()
//             : $.filterSectorEmployments.getValue()
//     );

//     search[e.source.type].query = e.value;

//     Alloy.Collections[e.source.type].fetch({
//         page: pageControl[e.source.type],
//         sector_id: sectorId,
//         query: search[e.source.type].query,
//         success: function (collection) {
//             // We need the next for Infinity scroll works
//             $.isCandidate.load();
//             $.isCandidate.mark();
//         },
//         error: function (col) {
//             Alloy.Globals.showMessage(
//                 'No se pueden mostrar. Inténtelo mas tarde.'
//             );
//         },
//     });

//     if (e.source.type === 'candidates') {
//         // Trick to hide the control and show the ListView
//         $.searchBarCandidates.value = '';
//         $.searchBarCandidates.hide();
//         $.searchBarCandidates.show();
//     } else {
//         $.searchBarEmployments.value = '';
//         $.searchBarEmployments.hide();
//         $.searchBarEmployments.show();
//     }
// }

// function getSectorId(sectorName = '') {
//     const sectorId = sectors.filter((sector) => sector.name === sectorName);

//     return sectorId.length === 0 ? '' : sectorId[0].id;
// }

// function candidateExistsRequest() {
//     if (Alloy.Globals.guest == false) {
//         return false;
//     }

//     if (_.isNull(Alloy.Globals.candidate)) {
//         return false;
//     }

//     Alloy.Globals.Api.readCandidates(
//         {
//             page: 1,
//             sector_id: search['candidates'].sectorId,
//             query: Alloy.Globals.candidate.id || '',
//         },
//         (response) => {
//             if (response.data.length === 0) {
//                 Alloy.Globals.candidate = null;
//                 Ti.App.Properties.removeProperty('candidate');
//                 return false;
//             } else {
//                 return true;
//             }
//         }
//     );
// }
