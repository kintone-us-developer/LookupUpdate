jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
    var TEXT_ROW_NUM;

    if (!CONF.hasOwnProperty('line_number')) {
        TEXT_ROW_NUM = Number(CONF['text_row_number']);
        for (var t = 1; t < TEXT_ROW_NUM + 1; t++) {
            CONF['text_row' + t] = JSON.parse(CONF['text_row' + t]);
        }
    } else {
        CONF['body_text'] = JSON.parse(CONF['body_text']);
        TEXT_ROW_NUM = 10;
    }

    $(document).ready(function() {
        var terms = {
            'en': {
                'cf_text_title': 'Text Format Conditions',
                'cf_date_title': 'Date Format Conditions',
                'cf_text_column1': 'Field with condition',
                'cf_text_column2': 'Condition',
                'cf_text_column3': 'Value',
                'cf_text_column4': 'Field to format',
                'cf_text_column5': 'Font Color',
                'cf_text_column6': 'Background Color',
                'cf_text_column7': 'Font Size',
                'cf_text_column8': 'Style',
                'cf_text_column2_option1': 'includes',
                'cf_text_column2_option2': 'doesn\'t include',
                'cf_text_column2_option3': '= (equal to)',
                'cf_text_column2_option4': '≠ (doesn\'t equal)',
                'cf_text_column2_option5': '≦ (equal or less)',
                'cf_text_column2_option6': '< (less than)',
                'cf_text_column2_option7': '≧ (equal or greater)',
                'cf_text_column2_option8': '> (greater than)',
                'cf_text_column7_option1': 'Normal',
                'cf_text_column7_option2': 'Very Small',
                'cf_text_column7_option3': 'Small',
                'cf_text_column7_option4': 'Large',
                'cf_text_column7_option5': 'Very Large',
                'cf_text_column8_option1': 'Normal',
                'cf_text_column8_option2': 'Bold',
                'cf_text_column8_option3': 'Underline',
                'cf_text_column8_option4': 'Strikethrough',
                'cf_plugin_submit': '     Save   ',
                'cf_plugin_cancel': '  Cancel   ',
                'cf_required_field': 'Required field is empty.'
            }
        };

        // To switch the display by the login user's language (default English)
        var lang = kintone.getLoginUser().language;
        var i18n = (lang in terms) ? terms[lang] : terms['en'];

        var configHtml = $('#cf-plugin').html();
        var tmpl = $.templates(configHtml);
        $('div#cf-plugin').html(tmpl.render({'terms': i18n}));

        function escapeHtml(htmlstr) {
            return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        function checkRowNumber() {
            if ($('#cf-plugin-text-tbody > tr').length === 2) {
                $('#cf-plugin-text-tbody > tr .removeList').eq(1).hide();
            } else {
                $('#cf-plugin-text-tbody > tr .removeList').eq(1).show();
            }
        }

        function setTextDefault() {
            for (var ti = 1; ti <= TEXT_ROW_NUM; ti++) {
                $('#cf-plugin-text-tbody > tr').eq(0).clone(true).insertAfter(
                    $('#cf-plugin-text-tbody > tr').eq(ti - 1)
                );
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column1').val(CONF['text_row' + ti]['field']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column2').val(CONF['text_row' + ti]['type']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column3').val(CONF['text_row' + ti]['value']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column4').
                    val(CONF['text_row' + ti]['targetfield']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column5').
                    val(CONF['text_row' + ti]['targetcolor']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column6').
                    val(CONF['text_row' + ti]['targetbgcolor']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column7').
                    val(CONF['text_row' + ti]['targetsize']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column8').
                    val(CONF['text_row' + ti]['targetfont']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column5').
                    css('color', CONF['text_row' + ti]['targetcolor']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column6').
                    css('background-color', CONF['text_row' + ti]['targetbgcolor']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column5').
                    parent('div').find('i').css('border-bottom-color', CONF['text_row' + ti]['targetcolor']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column6').
                    parent('div').find('i').css('border-bottom-color', CONF['text_row' + ti]['targetbgcolor']);
                $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column5-color').
                    val(CONF['text_row' + ti]['targetcolor']);
                if (CONF['text_row' + ti]['targetbgcolor'] !== '#') {
                    $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column6-color').
                        val(CONF['text_row' + ti]['targetbgcolor']);
                } else {
                    $('#cf-plugin-text-tbody > tr:eq(' + ti + ') .cf-plugin-column6-color').val('#808080');
                }
            }
        }

        function setDefault() {
            if (TEXT_ROW_NUM > 0) {
                setTextDefault();
            } else {
                // Insert Row
                $('#cf-plugin-text-tbody > tr').eq(0).clone(true).insertAfter($('#cf-plugin-text-tbody > tr')).eq(0);
            }
            checkRowNumber();
        }

        function setDropdown() {
            var param = {'app': kintone.app.getId()};
            kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', param, function(resp) {
                for (var key in resp.properties) {
                    if (!resp.properties.hasOwnProperty(key)) { continue; }
                    var prop = resp.properties[key];
                    var $option = $('<option>');

                    switch (prop.type) {
                        case 'SINGLE_LINE_TEXT':
                        case 'NUMBER':
                        case 'CALC':
                        case 'RADIO_BUTTON':
                        case 'DROP_DOWN':
                        case 'RECORD_NUMBER':
                        case 'MULTI_LINE_TEXT':
                        case 'CHECK_BOX':
                        case 'MULTI_SELECT':
                            $option.attr('value', escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $('#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column1').append($option.clone());
                            $('#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column4').append($option.clone());
                            $('#cf-plugin-date-tbody > tr:eq(0) .cf-plugin-column4').append($option.clone());
                            break;

                        case 'DATE':
                        case 'DATETIME':
                        case 'CREATED_TIME':
                        case 'UPDATED_TIME':
                        case 'STATUS':
                        default:
                            break;
                    }
                }
                setDefault();
            });
        }
        // Add Row
        $('#cf-plugin-text-tbody .addList').click(function() {
            $('#cf-plugin-text-tbody > tr').eq(0).clone(true).insertAfter($(this).parent().parent());
            checkRowNumber();
        });

        // Remove Row
        $('.removeList').click(function() {
            $(this).parent('td').parent('tr').remove();
            checkRowNumber();
        });

        function createErrorMessage(type, error_num, row_num) {
            var user_lang = kintone.getLoginUser().language;
            var error_messages = {
                'ja': {
                    'text': {
                        '1': '文字条件書式の' + row_num + '行目の必須入力項目を入力してください',
                        '2': '文字条件書式の' + row_num + '行目の文字色には\nカラーコード「#000000-#FFFFFF」を入力してください',
                        '3': '文字条件書式の' + row_num + '行目の背景色には\nカラーコード「#000000-#FFFFFF」を入力してください',
                        '4': '文字条件書式の' + row_num + '行目の条件値または色に\n' + 'HTML特殊文字(&, <, >, ", \')を入力することはできません'
                    },
                    'date': {
                        '1': '日付条件書式の' + row_num + '行目の必須入力項目を入力してください',
                        '2': '日付条件書式の' + row_num + '行目の条件値には\n半角数字を入力してください',
                        '3': '日付条件書式の' + row_num + '行目の条件値には\n整数を入力してください',
                        '4': '日付条件書式の' + row_num + '行目の文字色には\nカラーコード「#000000-#FFFFFF」を入力してください',
                        '5': '日付条件書式の' + row_num + '行目の背景色には\nカラーコード「#000000-#FFFFFF」を入力してください',
                        '6': '日付条件書式の' + row_num + '行目の条件値または色に\nHTML特殊文字(&, <, >, ", \')を入力することはできません'
                    }
                },
                'en': {
                    'text': {
                        '1': 'Required fields for Text Format Conditions row ' + row_num + ' are empty.',
                        '2': 'Input "#000000 ~ #FFFFFF" for Font Color in Text Format Conditions row ' +
                                row_num + '.',
                        '3': 'Input "#000000 ~ #FFFFFF" for Background Color in Text Format Conditions row ' +
                                row_num + '.',
                        '4': 'Text Format Conditions row ' + row_num + ' includes HTML Characters.'
                    },
                    'date': {
                        '1': 'Required fields for Date Format Conditions row ' + row_num + ' are empty.',
                        '2': 'Input integers for Value of Date Format Conditions row ' + row_num + '.',
                        '3': 'Input integers for Value of Date Format Conditions row ' + row_num + '.',
                        '4': 'Input "#000000 ~ #FFFFFF" for Font Color of Date Format Conditions row ' +
                                row_num + '.',
                        '5': 'Input "#000000 ~ #FFFFFF" for Background Color of Date Format Conditions row ' +
                                row_num + '.',
                        '6': 'Date Format Conditions row ' + row_num + ' includes HTML Characters.'
                    }
                },
                'zh': {
                    'text': {
                        '1': '文字条件格式的第' + row_num + '行有必填项未填写',
                        '2': '文字条件格式的第' + row_num + '行的字体颜色框中\n请输入颜色代码[#000000-#FFFFFF]',
                        '3': '文字条件格式的第' + row_num + '行的背景色框中\n请输入颜色代码[#000000-#FFFFFF]',
                        '4': '文字条件格式的第' + row_num + '行的条件值或颜色不可输入\nHTML特殊符号(&, <, >, ", \')'
                    },
                    'date': {
                        '1': '日期条件格式的第' + row_num + '行有必填项未填写',
                        '2': '日期条件格式的第' + row_num + '行的条件值\n仅可输入半角数字',
                        '3': '日期条件格式的第' + row_num + '行的条件值\n仅可输入整数',
                        '4': '日期条件格式的第' + row_num + '行的字体颜色\n请输入颜色代码[#000000-#FFFFFF]',
                        '5': '日期条件格式的第' + row_num + '行的背景色\n请输入颜色代码[#000000-#FFFFFF]',
                        '6': '日期条件格式的第' + row_num + '行的条件值或颜色不可输入\nHTML特殊符号(&, <, >, ", \')'
                    }
                }
            };
            return error_messages[user_lang][type][error_num];
        }

        function checkConfigTextValues(config) {
            var text_row_num = Number(config['text_row_number']);
            for (var ct = 1; ct <= text_row_num; ct++) {
                var text = JSON.parse(config['text_row' + ct]);
                if (!text.field || !text.type || !text.targetfield) {
                    throw new Error(createErrorMessage('text', '1', ct));
                }

                if (text.targetcolor.slice(0, 1) !== '#') {
                    throw new Error(createErrorMessage('text', '2', ct));
                }

                if (text.targetcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (text.targetcolor !== '#000000') {
                        throw new Error(createErrorMessage('text', '2', ct));
                    }
                }

                if (text.targetbgcolor.slice(0, 1) !== '#') {
                    throw new Error(createErrorMessage('text', '3', ct));
                }

                if (text.targetbgcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (text.targetbgcolor !== '#') {
                        throw new Error(createErrorMessage('text', '3', ct));
                    }
                }
                if (text.value.match(/&|<|>|"|'/g) !== null ||
                    text.targetcolor.match(/&|<|>|"|'/g) !== null ||
                    text.targetbgcolor.match(/&|<|>|"|'/g) !== null) {
                    throw new Error(createErrorMessage('text', '4', ct));
                }
            }
        }

        function checkConfigDateValues(config) {
            var date_row_num = Number(config['date_row_number']);
            for (var cd = 1; cd <= date_row_num; cd++) {
                var date = JSON.parse(config['date_row' + cd]);
                if (!date.field || !date.type || !date.targetfield || !date.value) {
                    throw new Error(createErrorMessage('date', '1', cd));
                }
                if (isNaN(date.value)) {
                    throw new Error(createErrorMessage('date', '2', cd));
                }
                if (date.value.indexOf('.') > -1) {
                    throw new Error(createErrorMessage('date', '3', cd));
                }
                if (date.targetcolor.slice(0, 1) !== '#') {
                    throw new Error(createErrorMessage('date', '4', cd));
                }
                if (date.targetcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (date.targetcolor !== '#000000') {
                        throw new Error(createErrorMessage('date', '4', cd));
                    }
                }
                if (date.targetbgcolor.slice(0, 1) !== '#') {
                    throw new Error(createErrorMessage('date', '5', cd));
                }
                if (date.targetbgcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (date.targetbgcolor !== '#') {
                        throw new Error(createErrorMessage('date', '5', cd));
                    }
                }
                if (date.value.match(/&|<|>|"|'/g) !== null ||
                    date.targetcolor.match(/&|<|>|"|'/g) !== null ||
                    date.targetbgcolor.match(/&|<|>|"|'/g) !== null) {
                    throw new Error(createErrorMessage('date', '6', cd));
                }
            }
        }

        function getValues(type, num) {
            switch (type) {
                case 'text':
                    return {
                        'field': $('#cf-plugin-text-tbody > tr:eq(' + num + ') .cf-plugin-column1').val(),
                        'type': $('#cf-plugin-text-tbody > tr:eq(' + num + ') .cf-plugin-column2').val(),
                        'value': $('#cf-plugin-text-tbody > tr:eq(' + num + ') .cf-plugin-column3').val().toString(),
                        'targetfield': $('#cf-plugin-text-tbody > tr:eq(' + num + ') .cf-plugin-column4').val(),
                        'targetcolor': $('#cf-plugin-text-tbody > tr:eq(' + num + ') .cf-plugin-column5').val(),
                        'targetbgcolor': $('#cf-plugin-text-tbody > tr:eq(' + num + ') .cf-plugin-column6').val(),
                        'targetsize': $('#cf-plugin-text-tbody > tr:eq(' + num + ') .cf-plugin-column7').val(),
                        'targetfont': $('#cf-plugin-text-tbody > tr:eq(' + num + ') .cf-plugin-column8').val()
                    };
                case 'date':
                    return {
                        'field': $('#cf-plugin-date-tbody > tr:eq(' + num + ') .cf-plugin-column1').val(),
                        'type': $('#cf-plugin-date-tbody > tr:eq(' + num + ') .cf-plugin-column2').val(),
                        'value': $('#cf-plugin-date-tbody > tr:eq(' + num + ') .cf-plugin-column3').val().toString(),
                        'type2': $('#cf-plugin-date-tbody > tr:eq(' + num + ') .cf-plugin-column3-select2').val(),
                        'targetfield': $('#cf-plugin-date-tbody > tr:eq(' + num + ') .cf-plugin-column4').val(),
                        'targetcolor': $('#cf-plugin-date-tbody > tr:eq(' + num + ') .cf-plugin-column5').val(),
                        'targetbgcolor': $('#cf-plugin-date-tbody > tr:eq(' + num + ') .cf-plugin-column6').val(),
                        'targetsize': $('#cf-plugin-date-tbody > tr:eq(' + num + ') .cf-plugin-column7').val(),
                        'targetfont': $('#cf-plugin-date-tbody > tr:eq(' + num + ') .cf-plugin-column8').val()
                    };
                default:
                    return '';
            }
        }

        function createConfig() {
            var config = {};
            var text_row_num = $('#cf-plugin-text-tbody > tr').length - 1;
            for (var ct = 1; ct <= text_row_num; ct++) {
                var text = getValues('text', ct);
                if (text.field === '' && text.type === '' && text.targetfield === '') {
                    // Remove unnecessary row
                    $('#cf-plugin-text-tbody > tr:eq(' + ct + ')').remove();
                    text_row_num = text_row_num - 1;
                    ct--;
                    continue;
                }
                config['text_row' + ct] = JSON.stringify(text);
            }
            config['text_row_number'] = String(text_row_num);
            var date_row_num = $('#cf-plugin-date-tbody > tr').length - 1;
            for (var cd = 1; cd <= date_row_num; cd++) {
                var date = getValues('date', cd);
                if (date.field === '' && date.type === '' && date.targetfield === '') {
                    // Remove unnecessary row
                    $('#cf-plugin-date-tbody > tr:eq(' + cd + ')').remove();
                    date_row_num = date_row_num - 1;
                    cd--;
                    continue;
                }
                config['date_row' + cd] = JSON.stringify(getValues('date', cd));
            }
            config['date_row_number'] = String(date_row_num);
            return config;
        }

        // Save
        $('#cf-submit').click(function() {
            try {
                var config = createConfig();
                checkConfigTextValues(config);
                checkConfigDateValues(config);
                kintone.plugin.app.setConfig(config);
            } catch (error) {
                alert(error.message);
            }
        });

        // Cancel
        $('#cf-cancel').click(function() {
            window.history.back();
        });
        setDropdown();
    });
})(jQuery, kintone.$PLUGIN_ID);
