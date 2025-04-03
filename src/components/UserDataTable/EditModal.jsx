import React from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const EditModal = ({ visible, onCancel, onOk, record }) => {
  const [form] = Form.useForm();

  // 미리 정의된 옵션들
  const workIntensityOptions = ['매우 심함', '심함', '보통', '적음', '매우 적음'];
  const symptomsOptions = ['두통', '어지러움', '피로감', '불면증', '스트레스', '목통증', '요통', '관절통', '소화불량', '호흡곤란', '불안감', '우울감'];
  const medicationOptions = ['혈압약', '당뇨약', '진통제', '소화제', '수면제', '항생제', '영양제', '한약'];
  const preferenceOptions = ['커피', '술', '담배', '탄산음료', '초콜릿', '패스트푸드', '인스턴트식품'];

  React.useEffect(() => {
    if (visible && record) {
      // 문자열로 저장된 데이터를 배열로 변환
      const defaultValues = {
        ...record,
        workIntensity: record.workIntensity || [],
        symptoms: record.symptoms ? record.symptoms.split(',').filter(Boolean) : [],
        medication: record.medication ? record.medication.split(',').filter(Boolean) : [],
        preference: record.preference ? record.preference.split(',').filter(Boolean) : [],
        memo: record.memo || ''
      };
      form.setFieldsValue(defaultValues);
    }
  }, [visible, record, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 배열 데이터를 문자열로 변환
      const processedValues = {
        ...values,
        symptoms: values.symptoms?.join(',') || '',
        medication: values.medication?.join(',') || '',
        preference: values.preference?.join(',') || ''
      };
      await onOk(processedValues);
      form.resetFields();
    } catch (error) {
      console.error('폼 제출 오류:', error);
    }
  };

  return (
    <Modal
      title="데이터 수정"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={record}
      >
        <Form.Item name="name" label="이름" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="gender" label="성별" rules={[{ required: true }]}>
          <Select>
            <Option value="남">남</Option>
            <Option value="여">여</Option>
          </Select>
        </Form.Item>

        <Form.Item name="personality" label="성격">
          <Select>
            <Option value="매우 급함">매우 급함</Option>
            <Option value="급함">급함</Option>
            <Option value="보통">보통</Option>
            <Option value="느긋">느긋</Option>
            <Option value="매우 느긋">매우 느긋</Option>
          </Select>
        </Form.Item>

        <Form.Item name="stress" label="스트레스">
          <Input />
        </Form.Item>

        <Form.Item name="workIntensity" label="노동강도">
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="노동강도를 선택하세요"
            options={workIntensityOptions.map(item => ({ label: item, value: item }))}
          />
        </Form.Item>

        <Form.Item
          name="residentNumber"
          label="주민등록번호"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="height"
          label="신장(cm)"
          rules={[{ required: true, message: '키를 입력하세요' }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="weight"
          label="체중(kg)"
          rules={[{ required: true, message: '체중을 입력하세요' }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="bmi"
          label="BMI"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="pulse"
          label="맥박"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="systolicBP"
          label="수축기 혈압"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="diastolicBP"
          label="이완기 혈압"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="ab_ms"
          label="a-b(ms)"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="ac_ms"
          label="a-c(ms)"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="ad_ms"
          label="a-d(ms)"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="ae_ms"
          label="a-e(ms)"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="ba_ratio"
          label="b/a"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="ca_ratio"
          label="c/a"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="da_ratio"
          label="d/a"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="ea_ratio"
          label="e/a"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item name="symptoms" label="증상">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="증상을 선택하세요"
            options={symptomsOptions.map(item => ({ label: item, value: item }))}
            allowClear
          />
        </Form.Item>

        <Form.Item name="medication" label="복용약물">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="복용 중인 약물을 선택하세요"
            options={medicationOptions.map(item => ({ label: item, value: item }))}
            allowClear
          />
        </Form.Item>

        <Form.Item name="preference" label="기호식품">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="기호식품을 선택하세요"
            options={preferenceOptions.map(item => ({ label: item, value: item }))}
            allowClear
          />
        </Form.Item>

        <Form.Item name="memo" label="메모">
          <TextArea 
            rows={3} 
            placeholder="메모를 입력하세요"
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal; 