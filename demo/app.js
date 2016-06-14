/* eslint-disable no-alert, no-console */
/* eslint-disable import/no-extraneous-dependencies */

import 'bootstrap-loader';

import React from 'react';
import ReactDOM from 'react-dom';

import { Button } from '../modules/buttons';
import {
    CollapsibleCheckboxProperty,
    CollapsibleProperty,
    FakeAutoCompleteInputs,
    Form,
    InputCheckbox,
    InputDate,
    InputTextarea,
    InputUploader,
    Property
} from '../modules/form';
import { Checkbox, Grouping } from '../modules/ui';
import { UploadButton, UploadDragAndDropArea } from '../modules/uploader';

import { arrayFrom } from '../modules/utils/general';

import './app.scss';


// TODO: turn this into a nicely formatted styleguide
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
                Well, this could certainly be made better, ideally we'd have an auto-generated
                styleguide or something... but for now you can enjoy this
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
                <Button className="active focus" classType="secondary">Secondary Active</Button>
                <Button disabled classType="secondary">Secondary Disabled</Button>
                <Button classType="secondary" size="xs">Secondary XS</Button>
                <Button classType="secondary" size="sm">Secondary SM</Button>
                <Button classType="secondary" size="lg">Secondary LG</Button>
                <Button classType="secondary" href="http://www.google.com" size="lg">Primary LG Anchor</Button>
                <div>
                    <Button wide classType="secondary">Secondary Wide</Button>
                </div>
            </div>
            <h3>Tertiary Button</h3>
            <div>
                <Button classType="tertiary">Tertiary</Button>
                <Button className="active focus" classType="tertiary">Tertiary Active</Button>
                <Button disabled classType="tertiary">Tertiary Disabled</Button>
                <Button classType="tertiary" size="xs">Tertiary XS</Button>
                <Button classType="tertiary" size="sm">Tertiary SM</Button>
                <Button classType="tertiary" size="lg">Tertiary LG</Button>
                <Button classType="tertiary" href="http://www.google.com" size="lg">Primary LG Anchor</Button>
                <div>
                    <Button wide classType="tertiary">Tertiary Wide</Button>
                </div>
            </div>
            <h3>Button Grouping</h3>
            <div>
                <Grouping>
                    <Button>Button 1</Button>
                    <Button classType="secondary">Button 2</Button>
                    <Button classType="tertiary">Button 3</Button>
                </Grouping>
            </div>
            <h4>Pulled right</h4>
            <div>
                <div className="clearfix">
                    <Grouping className="pull-right">
                        <Button>Button 1</Button>
                        <Button classType="secondary">Button 2</Button>
                        <Button classType="tertiary">Button 3</Button>
                    </Grouping>
                </div>
            </div>
            <h4>Vertical</h4>
            <div>
                <Grouping vertical>
                    <Button>Button 1</Button>
                    <Button classType="secondary">Button 2</Button>
                    <Button classType="tertiary">Button 3</Button>
                </Grouping>
            </div>
            <h4>Vertical pulled right</h4>
            <div>
                <div className="clearfix">
                    <Grouping vertical className="pull-right">
                        <Button>Button 1</Button>
                        <Button classType="secondary">Button 2</Button>
                        <Button classType="tertiary">Button 3</Button>
                    </Grouping>
                </div>
            </div>
            <h4>Anchor buttons</h4>
            <div>
                <Grouping>
                    <Button href="http://www.google.com">Button 1</Button>
                    <Button classType="secondary" href="http://www.google.com">Button 2</Button>
                    <Button classType="tertiary" href="http://www.google.com">Button 3</Button>
                </Grouping>
            </div>
            <h2>Forms</h2>
            <h3>Basic Form</h3>
            <div>
                <Form
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <div>Should be ignored in refs</div>
                    <Property
                        label="Basic property"
                        name="basic">
                        <input placeholder="basic placeholder" type="text" />
                    </Property>
                    <Property
                        label="Default value label"
                        name="default">
                        <input
                            defaultValue="default"
                            placeholder="default value placeholder"
                            type="text" />
                    </Property>
                    <Property
                        label="Required property label"
                        name="required">
                        <input required placeholder="required property placeholder" type="text" />
                    </Property>
                    <Property
                        footer="footer"
                        label="Footer property label"
                        name="footer">
                        <input placeholder="footer property placeholder" type="text" />
                    </Property>
                    <Property
                        label="Plain checkbox property label"
                        name="checkbox">
                        <input defaultChecked type="checkbox" />
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
                        <input
                            defaultValue="higlighted"
                            placeholder="highlighted placeholder"
                            type="text" />
                    </Property>
                    <Property
                        ignoreFocus
                        label="Ignore focus label"
                        name="ignorefocus">
                        <input
                            defaultValue="ignore focus"
                            placeholder="ignore focus placeholder"
                            type="text" />
                    </Property>
                    <Property
                        disabled
                        label="Disabled property label"
                        name="disabled">
                        <input
                            defaultValue="disabled"
                            placeholder="disabled property placeholder"
                            type="text" />
                    </Property>
                    <Property
                        hidden
                        label="Hidden property label"
                        name="hidden">
                        <input
                            defaultValue="hidden"
                            placeholder="hidden property placeholder"
                            type="text" />
                    </Property>
                </Form>
            </div>
            <div>
                <Form
                    autoComplete="on"
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <Property
                        label="Autocomplete username label"
                        name="username">
                        <input placeholder="autocomplete username placeholder" type="text" />
                    </Property>
                    <Property
                        label="Autocomplete password label"
                        name="password">
                        <input placeholder="autocomplete password placeholder" type="text" />
                    </Property>
                </Form>
            </div>
            <h3>Custom buttons form</h3>
            <div>
                <Form
                    buttonDefault={<Button>Custom default button</Button>}
                    buttonEdited={<Button>Custom edited button</Button>}
                    buttonSubmitting={<Button>Custom submitting button</Button>}
                    onSubmit={(data) => {
                        console.log(data);
                        console.log('Wait 10s for submission to end...');
                        return new Promise((resolve) => {
                            setTimeout(resolve, 10000);
                        });
                    }}>
                    <Property
                        label="Custom buttons label"
                        name="custom buttons">
                        <input placeholder="custom buttons placeholder" type="text" />
                    </Property>
                </Form>
            </div>
            <h3>Custom fake autocomplete form</h3>
            <div>
                <Form
                    fakeAutoCompleteInputs={
                        (<FakeAutoCompleteInputs fields={[{ name: 'name', type: 'password' }]} />)
                    }
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <Property
                        label="Fake autocomplete label"
                        name="fake autocomplete">
                        <input placeholder="fake autocomplete placeholder" type="text" />
                    </Property>
                </Form>
            </div>
            <h3>Collapsible Properties</h3>
            <div>
                <Form
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
                        checked
                        disabled
                        checkboxLabel="disabled prop"
                        label="disabled prop label"
                        name="disabled">
                        <input
                            defaultValue="disabled"
                            placeholder="disabled placeholder"
                            type="text" />
                    </CollapsibleCheckboxProperty>
                </Form>
            </div>
            <h3>Custom Inputs</h3>
            <div>
                <Form
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
                        checkboxLabel="default checkbox"
                        label="default checkbox label"
                        name="defaultCheckbox">
                        <InputCheckbox defaultChecked label="defaultCheckbox" />
                    </CollapsibleCheckboxProperty>
                    <CollapsibleCheckboxProperty
                        checkboxLabel="required checkbox"
                        label="required checkbox label"
                        name="requiredCheckbox">
                        <InputCheckbox required label="required checkbox" />
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
                        disabled
                        checkboxLabel="disabled textarea"
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
                    wide
                    classType="secondary"
                    uploaderProps={dummyUploaderProps} />
            </div>
            <h4>Disabled upload button</h4>
            <div>
                <UploadButton disabled uploaderProps={dummyUploaderProps} />
            </div>
            <h3>Drag and drop</h3>
            <div>
                <UploadDragAndDropArea uploaderProps={dummyUploaderProps}>
                    <div style={{ 'width': 100, 'height': 100, 'backgroundColor': 'green' }} />
                </UploadDragAndDropArea>
            </div>
            <h3>Drag and drop ignore files</h3>
            <div>
                <UploadDragAndDropArea
                    onDrop={(event) => {
                        if (event && event.dataTransfer && event.dataTransfer.files.length > 0) {
                            const droppedFiles = arrayFrom(event.dataTransfer.files)
                                .reduce((names, file) => `${names} ${file.name}`, '');

                            alert(`Ignoring dropped files: ${droppedFiles}`);
                        }
                    }}
                    uploaderProps={dummyUploaderProps}>
                    <div style={{ 'width': 100, 'height': 100, 'backgroundColor': 'red' }} />
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
                            onFilesValidationChange={(prevResult, nextResult) => (
                                alert(`file validation toggled with prev: ${prevResult} ` +
                                      `and next: ${nextResult}`)
                            )}>
                            <UploadButton className="upload-input" uploaderProps={dummyUploaderProps} />
                        </InputUploader>
                    </Property>
                </Form>
            </div>
        </div>
    );
};

ReactDOM.render((<App />), document.getElementById('demo-app'));
