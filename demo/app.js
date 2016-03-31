import 'bootstrap-loader';
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import { Button, ButtonContainer, ButtonList } from '../modules/buttons';
import { CollapsibleCheckboxProperty, CollapsibleProperty, Form, InputCheckbox, InputDate, InputTextarea, InputUploader, Property } from '../modules/form';
import { Checkbox } from '../modules/ui';
import { UploadButton, UploadDragAndDropArea } from '../modules/uploader';

import { arrayFrom } from '../modules/utils/general';

import './app.scss';


//TODO: turn this into a nicely formatted styleguide
const App = () => {
    const dummyUploaderProps = {
        objectProperties: {
            bucket: 'dummy_bucket'
        },
        signature: {
            endpoint: 's3/signature/'
        }
    };

    return (
        <div>
            <marquee direction="right">
                Well, this could certainly be made better, ideally we'd have an auto-generated styleguide or something... but for now you can enjoy this
            </marquee>
            <h2>Buttons</h2>
            <h3>Primary Button</h3>
            <div>
                <Button>Primary</Button>
                <Button className="active focus">Primary Active</Button>
                <Button disabled>Primary Disabled</Button>
                <Button size="xs">Primary XS</Button>
                <Button size="sm">Primary SM</Button>
                <Button size="lg">Primary LG</Button>
                <Button href="http://www.google.com" size="lg">Primary LG Anchor</Button>
                <div>
                    <Button wide>Primary Wide</Button>
                </div>
            </div>
            <h3>Secondary Button</h3>
            <div>
                <Button classType="secondary">Secondary</Button>
                <Button classType="secondary" className="active focus">Secondary Active</Button>
                <Button classType="secondary" disabled>Secondary Disabled</Button>
                <Button classType="secondary" size="xs">Secondary XS</Button>
                <Button classType="secondary" size="sm">Secondary SM</Button>
                <Button classType="secondary" size="lg">Secondary LG</Button>
                <Button classType="secondary" href="http://www.google.com" size="lg">Primary LG Anchor</Button>
                <div>
                    <Button classType="secondary" wide>Secondary Wide</Button>
                </div>
            </div>
            <h3>Tertiary Button</h3>
            <div>
                <Button classType="tertiary">Tertiary</Button>
                <Button classType="tertiary" className="active focus">Tertiary Active</Button>
                <Button classType="tertiary" disabled>Tertiary Disabled</Button>
                <Button classType="tertiary" size="xs">Tertiary XS</Button>
                <Button classType="tertiary" size="sm">Tertiary SM</Button>
                <Button classType="tertiary" size="lg">Tertiary LG</Button>
                <Button classType="tertiary" href="http://www.google.com" size="lg">Primary LG Anchor</Button>
                <div>
                    <Button classType="tertiary" wide>Tertiary Wide</Button>
                </div>
            </div>
            <h3>Button Container</h3>
            <div>
                <ButtonContainer>
                    <Button>A button</Button>
                </ButtonContainer>
            </div>
            <div>
                <ButtonContainer label="Container label">
                    <Button>A button with label</Button>
                </ButtonContainer>
            </div>
            <h3>Button List</h3>
            <div>
                <ButtonList>
                    <Button>Button 1</Button>
                    <Button classType="secondary">Button 2</Button>
                    <Button classType="tertiary">Button 3</Button>
                </ButtonList>
            </div>
            <h4>Pulled right</h4>
            <div>
                <ButtonList pull="right">
                    <Button>Button 1</Button>
                    <Button classType="secondary">Button 2</Button>
                    <Button classType="tertiary">Button 3</Button>
                </ButtonList>
            </div>
            <h4>Vertical</h4>
            <div>
                <ButtonList vertical>
                    <Button>Button 1</Button>
                    <Button classType="secondary">Button 2</Button>
                    <Button classType="tertiary">Button 3</Button>
                </ButtonList>
            </div>
            <h4>Vertical pulled right</h4>
            <div>
                <ButtonList pull="right" vertical>
                    <Button>Button 1</Button>
                    <Button classType="secondary">Button 2</Button>
                    <Button classType="tertiary">Button 3</Button>
                </ButtonList>
            </div>
            <h4>Anchor buttons</h4>
            <div>
                <ButtonList>
                    <Button href="http://www.google.com">Button 1</Button>
                    <Button classType="secondary" href="http://www.google.com">Button 2</Button>
                    <Button classType="tertiary" href="http://www.google.com">Button 3</Button>
                </ButtonList>
            </div>
            <h2>Forms</h2>
            <h3>Basic Form</h3>
            <div>
                <Form
                    header="Basic form"
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <div>Should be ignored in ref</div>
                    <Property
                        label="Prop 1 label"
                        name="prop1">
                        <input placeholder="prop 1 placeholder" type="text" />
                    </Property>
                    <Property
                        label="Default label"
                        name="default">
                        <input placeholder="default placeholder" type="text" defaultValue="default" />
                    </Property>
                    <Property
                        label="Required prop label"
                        name="required prop">
                        <input placeholder="required prop placeholder" required type="text" />
                    </Property>
                    <Property
                        footer="footer"
                        label="Footer prop label"
                        name="footer prop">
                        <input placeholder="footer prop placeholder" type="text" />
                    </Property>
                    <Property
                        label="Select prop label"
                        name="select">
                        <select>
                            <option value="value1">Value 1</option>
                            <option value="value2">Value 2</option>
                            <option value="value3">Value 3</option>
                        </select>
                    </Property>
                    <Property
                        highlighted
                        label="Highlighted label"
                        name="highlighted">
                        <input placeholder="highlighted placeholder" type="text" defaultValue="higlighted" />
                    </Property>
                    <Property
                        ignoreFocus
                        label="Ignore focus label"
                        name="ignorefocus">
                        <input placeholder="ignore focus placeholder" type="text" defaultValue="ignore focus" />
                    </Property>
                    <Property
                        disabled
                        label="Disabled prop label"
                        name="disabled">
                        <input placeholder="disabled prop placeholder" type="text" defaultValue="disabled" />
                    </Property>
                    <Property
                        hidden
                        label="Hidden prop label"
                        name="hidden">
                        <input placeholder="hidden prop placeholder" type="text" defaultValue="hidden" />
                    </Property>
                </Form>
            </div>
            <h3>Autocomplete form</h3>
            <div>
                <Form
                    autoComplete
                    header="Autocomplete form"
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <Property
                        label="Prop 1 label"
                        name="prop1">
                        <input placeholder="autocomplete placeholder" type="text" />
                    </Property>
                </Form>
            </div>
            <h3>Custom header form</h3>
            <div>
                <Form
                    header="Custom header form"
                    headerType={({ header }) => (<h5>{header}</h5>)}
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <Property
                        label="Prop 1 label"
                        name="prop1">
                        <input placeholder="custom header placeholder" type="text" />
                    </Property>
                </Form>
            </div>
            <h3>Custom buttons form</h3>
            <div>
                <Form
                    buttonDefault={<Button>Custom default button</Button>}
                    buttonEdited={<Button>Custom edited button</Button>}
                    buttonSubmitting={<Button>Custom submitting button</Button>}
                    header="Custom buttons form"
                    onSubmit={(data) => {
                        console.log(data);
                        console.log('Wait 10s for submission to end...');
                        return new Promise((resolve) => {
                            setTimeout(resolve, 10000);
                        });;
                    }}>
                    <Property
                        label="Prop 1 label"
                        name="prop1">
                        <input placeholder="custom buttons placeholder" type="text" />
                    </Property>
                </Form>
            </div>
            <h3>Collapsible Properties</h3>
            <div>
                <Form
                    header="Collapsible properties"
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <CollapsibleProperty
                        headerLabel="expanded prop"
                        label="Expanded label"
                        name="expanded">
                        <input placeholder="expanded placeholder" type="text" />
                    </CollapsibleProperty>
                    <CollapsibleProperty
                        expanded={false}
                        headerLabel="collapsed prop"
                        label="Collapsed label"
                        name="collapsed">
                        <input placeholder="collapsed placeholder" type="text" />
                    </CollapsibleProperty>
                    <CollapsibleCheckboxProperty
                        checked
                        checkboxLabel="checked prop"
                        label="Checked prop label"
                        name="checked">
                        <input placeholder="checked placeholder" type="text" />
                    </CollapsibleCheckboxProperty>
                    <CollapsibleCheckboxProperty
                        checkboxLabel="unchecked prop"
                        label="Unchecked prop label"
                        name="unchecked">
                        <input placeholder="unchecked placeholder" type="text" />
                    </CollapsibleCheckboxProperty>
                    <CollapsibleCheckboxProperty
                        checkboxLabel="disabled prop"
                        checked
                        disabled
                        label="disabled prop label"
                        name="disabled">
                        <input placeholder="disabled placeholder" type="text" defaultValue="disabled" />
                    </CollapsibleCheckboxProperty>
                </Form>
            </div>
            <h3>Custom Inputs</h3>
            <div>
                <Form
                    header="Custom inputs"
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <CollapsibleCheckboxProperty
                        checkboxLabel="checkbox"
                        label="checkbox label"
                        name="checkbox">
                        <InputCheckbox label="checkbox" />
                    </CollapsibleCheckboxProperty>
                    <CollapsibleCheckboxProperty
                        checkboxLabel="required checkbox"
                        label="required checkbox label"
                        name="requiredCheckbox">
                        <InputCheckbox label="required checkbox" required />
                    </CollapsibleCheckboxProperty>
                    <CollapsibleCheckboxProperty
                        checkboxLabel="date"
                        label="date label"
                        name="date">
                        <InputDate />
                    </CollapsibleCheckboxProperty>
                    <CollapsibleCheckboxProperty
                        checkboxLabel="default date"
                        label="default date label"
                        name="default Date">
                        <InputDate defaultValue="2010-01-01" />
                    </CollapsibleCheckboxProperty>
                    <CollapsibleCheckboxProperty
                        checkboxLabel="textarea"
                        label="textarea label"
                        name="textarea">
                        <InputTextarea placeholder="textarea" rows={2} />
                    </CollapsibleCheckboxProperty>
                    <CollapsibleCheckboxProperty
                        checkboxLabel="default textarea"
                        label="default textarea label"
                        name="defaulttextarea">
                        <InputTextarea defaultValue="default" rows={2} />
                    </CollapsibleCheckboxProperty>
                    <Property
                        checkboxLabel="disabled textarea"
                        disabled
                        label="disabled textarea label"
                        name="disabledtextarea">
                        <InputTextarea defaultValue="disabled" rows={2} />
                    </Property>
                </Form>
            </div>
            <h2>UI Elements</h2>
            <h3>Checkbox</h3>
            <div>
                <Checkbox label="checkbox" />
            </div>
            <h3>Disabled checkbox</h3>
            <div>
                <Checkbox disabled label="disabled checkbox" />
            </div>
            <h2>Uploader</h2>
            <h3>Upload button</h3>
            <div>
                <UploadButton uploaderProps={dummyUploaderProps} />
            </div>
            <h4>Custom upload button</h4>
            <div>
                <UploadButton
                    classType="secondary"
                    uploaderProps={dummyUploaderProps}
                    wide />
            </div>
            <h4>Disabled upload button</h4>
            <div>
                <UploadButton disabled uploaderProps={dummyUploaderProps} />
            </div>
            <h3>Drag and drop</h3>
            <div>
                <UploadDragAndDropArea uploaderProps={dummyUploaderProps}>
                    <div style={{'width': 100, 'height': 100, 'backgroundColor': 'green'}} />
                </UploadDragAndDropArea>
            </div>
            <h3>Drag and drop ignore files</h3>
            <div>
                <UploadDragAndDropArea
                    onDrop={(event) => {
                        if (event && event.dataTransfer && event.dataTransfer.files.length > 0) {
                            alert('Ignoring dropped files: ' + arrayFrom(event.dataTransfer.files).reduce((names, file) => `${names} ${file.name}`, ''));
                        }
                    }}
                    uploaderProps={dummyUploaderProps}>
                    <div style={{'width': 100, 'height': 100, 'backgroundColor': 'red'}} />
                </UploadDragAndDropArea>
            </div>
            <h3>Form Uploader</h3>
            <div>
                <Form
                    header="Uploader Form"
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <Property
                        label="input uploader"
                        name="inputuploader">
                        <InputUploader
                            filesValidation={(files) => files.length > 1}
                            onFilesValidationChange={(prevResult, nextResult) => {
                                alert(`file validation toggled with prev: ${prevResult} and next: ${nextResult}`);
                            }}>
                            <UploadButton uploaderProps={dummyUploaderProps} />
                        </InputUploader>
                    </Property>
                </Form>
            </div>
        </div>
    );
};

ReactDOM.render((<App />), document.getElementById('demo-app'));
