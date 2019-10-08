import React from 'react';
import TextAreaAutosize from 'react-textarea-autosize';
import {
  ContentState, EditorState, convertFromHTML, convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import ColorPic from './ColorPic';


import DynamicOptionList from './dynamic-option-list';


const toolbar_options = {
  options: ['inline', 'fontSize', 'fontFamily', 'textAlign', 'list', 'colorPicker', 'link', 'image'],
  inline: {
    inDropdown: false,
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
    options: ['bold', 'italic', 'underline', 'strikethrough'],
    bold: { className: undefined },
    italic: { className: undefined },
    underline: { className: undefined },
    strikethrough: { className: undefined },
  },
  blockType: {
    inDropdown: true,
    options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
  },
  fontSize: {
    options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
  },
  fontFamily: {
    options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
  },
  list: {
    inDropdown: false,
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
    options: ['unordered', 'ordered', 'indent', 'outdent'],
    unordered: { className: undefined },
    ordered: { className: undefined },
    indent: { className: undefined },
    outdent: { className: undefined },
  },
  textAlign: {
    inDropdown: false,
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
    options: ['left', 'center', 'right', 'justify'],
    left: { className: undefined },
    center: { className: undefined },
    right: { className: undefined },
    justify: { className: undefined },
  },
  colorPicker: {
    className: undefined,
    component: ColorPic,
    popupClassName: undefined
  },
  image: {
    className: undefined,
    component: undefined,
    popupClassName: undefined,
    urlEnabled: true,
    uploadEnabled: true,
    alignmentEnabled: true,
    uploadCallback: undefined,
    previewImage: false,
    inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
    alt: { present: false, mandatory: false },
    defaultSize: {
      height: 'auto',
      width: 'auto',
    },
  },
};


export default class FormElementsEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      element: this.props.element,
      data: this.props.data,
      dirty: false,
    };
  }

  toggleRequired() {
    // const this_element = this.state.element;
  }

  editElementProp(elemProperty, targProperty, e) {
    // elemProperty could be content or label
    // targProperty could be value or checked
    const this_element = this.state.element;
    this_element[elemProperty] = e.target[targProperty];

    this.setState({
      element: this_element,
      dirty: true,
    }, () => {
      if (targProperty === 'checked') { this.updateElement(); }
    });
  }

  onEditorStateChange(index, property, editorContent) {
    // const html = draftToHtml(convertToRaw(editorContent.getCurrentContent())).replace(/<p>/g, '<div>').replace(/<\/p>/g, '</div>');
    const html = draftToHtml(convertToRaw(editorContent.getCurrentContent())).replace(/<p>/g, '').replace(/<\/p>/g, '').replace(/(?:\r\n|\r|\n)/g, ' ');
    const this_element = this.state.element;
    this_element[property] = html;

    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  updateElement() {
    const this_element = this.state.element;
    // to prevent ajax calls with no change
    if (this.state.dirty) {
      this.props.updateElement.call(this.props.preview, this_element);
      this.setState({ dirty: false });
    }
  }

  convertFromHTML(content) {
    const newContent = convertFromHTML(content);
    if (!newContent.contentBlocks) {
      // to prevent crash when no contents in editor
      return EditorState.createEmpty();
    }
    const contentState = ContentState.createFromBlockArray(newContent);
    return EditorState.createWithContent(contentState);
  }

  render() {
    console.log("S: ", this.state);
    
    if (this.state.dirty) {
      this.props.element.dirty = true;
    }

    const this_checked = this.props.element.hasOwnProperty('required') ? this.props.element.required : false;
    const this_read_only = this.props.element.hasOwnProperty('readOnly') ? this.props.element.readOnly : false;
    const this_default_today = this.props.element.hasOwnProperty('defaultToday') ? this.props.element.defaultToday : false;
    const this_show_time_select = this.props.element.hasOwnProperty('showTimeSelect') ? this.props.element.showTimeSelect : false;
    const this_show_time_select_only = this.props.element.hasOwnProperty('showTimeSelectOnly') ? this.props.element.showTimeSelectOnly : false;
    const this_checked_inline = this.props.element.hasOwnProperty('inline') ? this.props.element.inline : false;
    const this_checked_bold = this.props.element.hasOwnProperty('bold') ? this.props.element.bold : false;
    const this_checked_italic = this.props.element.hasOwnProperty('italic') ? this.props.element.italic : false;
    const this_checked_center = this.props.element.hasOwnProperty('center') ? this.props.element.center : false;
    const this_checked_page_break = this.props.element.hasOwnProperty('pageBreakBefore') ? this.props.element.pageBreakBefore : false;
    const this_checked_alternate_form = this.props.element.hasOwnProperty('alternateForm') ? this.props.element.alternateForm : false;

    const {canHaveAlternateForm, canHaveDisplayHorizontal, canHaveOptionCorrect, canHaveOptionValue} = this.props.element;

    const this_custom_attributes = this.props.customAttributes && this.props.customAttributes.length > 0 ? this.props.customAttributes : [];

    const this_files = this.props.files.length ? this.props.files : [];
    if (this_files.length < 1 || (this_files.length > 0 && this_files[0].id !== '')) {
      this_files.unshift({ id: '', file_name: '' });
    }

    let editorState;
    if (this.props.element.hasOwnProperty('content')) {
      editorState = this.convertFromHTML(this.props.element.content);
    }
    if (this.props.element.hasOwnProperty('label')) {
      editorState = this.convertFromHTML(this.props.element.label);
    }

    console.log('12345');
    console.log(this.props);
    console.log(this_custom_attributes);
    

    return (
      <div>
        <div className="clearfix">
          <h4 className="pull-left">{this.props.element.text}</h4>
          <i className="pull-right fa fa-times dismiss-edit" onClick={this.props.manualEditModeOff}></i>
        </div>
        { this.props.element.hasOwnProperty('content') &&
          <div className="form-group">
            <label className="control-label">Text to display:</label>

            <Editor
              toolbar={toolbar_options}
              defaultEditorState={editorState}
              onBlur={this.updateElement.bind(this)}
              onEditorStateChange={this.onEditorStateChange.bind(this, 0, 'content')} />
          </div>
        }
        { this.props.element.hasOwnProperty('file_path') &&
          <div className="form-group">
            <label className="control-label" htmlFor="fileSelect">Choose file:</label>
            <select id="fileSelect" className="form-control" defaultValue={this.props.element.file_path} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'file_path', 'value')}>
              {this_files.map((file) => {
                const this_key = `file_${file.id}`;
                return <option value={file.id} key={this_key}>{file.file_name}</option>;
              })}
            </select>
          </div>
        }

        { this_custom_attributes.length > 0 ?
          <div className="form-group">
            <label className="control-label">Select Attribute</label>
            <select className="form-control" onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'selected_attribute', 'value')}>
              {this_custom_attributes.map(attr => <option value={attr.name} key={attr.name}>{attr.name}</option>)}
            </select>
          </div>
          :
          <React.Fragment />
        }
        { this.props.element.hasOwnProperty('href') &&
          <div className="form-group">
            <TextAreaAutosize type="text" className="form-control" defaultValue={this.props.element.href} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'href', 'value')} />
          </div>
        }
        { this.props.element.hasOwnProperty('src') &&
          <div>
            <div className="form-group">
              <label className="control-label" htmlFor="srcInput">Link to:</label>
              <input id="srcInput" type="text" className="form-control" defaultValue={this.props.element.src} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'src', 'value')} />
            </div>
            <div className="form-group">
              <div className="checkbox">
                <label>
                  <input type="checkbox" checked={this_checked_center} value={true} onChange={this.editElementProp.bind(this, 'center', 'checked')} />
                  Center?
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-3">
                <label className="control-label" htmlFor="elementWidth">Width:</label>
                <input id="elementWidth" type="text" className="form-control" defaultValue={this.props.element.width} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'width', 'value')} />
              </div>
              <div className="col-sm-3">
                <label className="control-label" htmlFor="elementHeight">Height:</label>
                <input id="elementHeight" type="text" className="form-control" defaultValue={this.props.element.height} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'height', 'value')} />
              </div>
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('label') &&
          <div className="form-group">
            <label>Display Label</label>
            <Editor
              toolbar={toolbar_options}
              defaultEditorState={editorState}
              onBlur={this.updateElement.bind(this)}
              onEditorStateChange={this.onEditorStateChange.bind(this, 0, 'label')} />

            <br />
            <div className="checkbox">
              <label>
                <input type="checkbox" checked={this_checked} value={true} onChange={this.editElementProp.bind(this, 'required', 'checked')} />
                Required
              </label>
            </div>
            { this.props.element.hasOwnProperty('readOnly') &&
              <div className="checkbox">
                <label>
                  <input type="checkbox" checked={this_read_only} value={true} onChange={this.editElementProp.bind(this, 'readOnly', 'checked')} />
                  Read only
                </label>
              </div>
            }
            { this.props.element.hasOwnProperty('defaultToday') &&
              <div className="checkbox">
                <label>
                  <input type="checkbox" checked={this_default_today} value={true} onChange={this.editElementProp.bind(this, 'defaultToday', 'checked')} />
                  Default to Today?
                </label>
              </div>
            }
            { this.props.element.hasOwnProperty('showTimeSelect') &&
              <div className="checkbox">
                <label>
                  <input type="checkbox" checked={this_show_time_select} value={true} onChange={this.editElementProp.bind(this, 'showTimeSelect', 'checked')} />
                  Show Time Select?
                </label>
              </div>
            }
            { this_show_time_select && this.props.element.hasOwnProperty('showTimeSelectOnly') &&
              <div className="checkbox">
                <label>
                  <input type="checkbox" checked={this_show_time_select_only} value={true} onChange={this.editElementProp.bind(this, 'showTimeSelectOnly', 'checked')} />
                  Show Time Select Only?
                </label>
              </div>
            }
            { (this.state.element.element === 'RadioButtons' || this.state.element.element === 'Checkboxes') && canHaveDisplayHorizontal &&
              <div className="checkbox">
                <label>
                  <input type="checkbox" checked={this_checked_inline} value={true} onChange={this.editElementProp.bind(this, 'inline', 'checked')} />
                  Display horizonal
                </label>
              </div>
            }
          </div>
        }

        {this.state.element.element === 'Signature' && this.props.element.readOnly
          ? (
            <div className="form-group">
              <label className="control-label" htmlFor="variableKey">Variable Key:</label>
              <input id="variableKey" type="text" className="form-control" defaultValue={this.props.element.variableKey} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'variableKey', 'value')} />
              <p className="help-block">This will give the element a key that can be used to replace the content with a runtime value.</p>
            </div>
          )
          : (<div/>)
        }

        { this.props.element.hasOwnProperty('step') &&
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeStep">Step</label>
              <input id="rangeStep" type="number" className="form-control" defaultValue={this.props.element.step} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'step', 'value')} />
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('min_value') &&
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeMin">Min</label>
              <input id="rangeMin" type="number" className="form-control" defaultValue={this.props.element.min_value} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'min_value', 'value')} />
              <input type="text" className="form-control" defaultValue={this.props.element.min_label} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'min_label', 'value')} />
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('max_value') &&
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeMax">Max</label>
              <input id="rangeMax" type="number" className="form-control" defaultValue={this.props.element.max_value} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'max_value', 'value')} />
              <input type="text" className="form-control" defaultValue={this.props.element.max_label} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'max_label', 'value')} />
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('default_value') &&
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="defaultSelected">Default Selected</label>
              <input id="defaultSelected" type="number" className="form-control" defaultValue={this.props.element.default_value} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'default_value', 'value')} />
            </div>
          </div>
        }

        { this.props.showCorrectColumn && this.props.element.canHaveAnswer && !this.props.element.hasOwnProperty('options') &&
          <div className="form-group">
            <label className="control-label" htmlFor="correctAnswer">Correct Answer</label>
            <input id="correctAnswer" type="text" className="form-control" defaultValue={this.props.element.correct} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'correct', 'value')} />
          </div>
        }
        { this.props.element.hasOwnProperty('options') &&
          <DynamicOptionList showCorrectColumn={this.props.showCorrectColumn}
            canHaveOptionCorrect={canHaveOptionCorrect}
            canHaveOptionValue={canHaveOptionValue}
            data={this.props.preview.state.data}
            updateElement={this.props.updateElement}
            preview={this.props.preview}
            element={this.props.element}
            key={this.props.element.options.length} />
        }
      </div>
    );
  }
}
FormElementsEdit.defaultProps = { className: 'edit-element-fields' };
