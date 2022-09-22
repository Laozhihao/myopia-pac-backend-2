import React, { useRef, useState } from 'react';
import { Button, message } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import { listColumns, VisionColumnsType } from './columns';
import { EMPTY } from '@/utils/constant';
import { PlusOutlined } from '@ant-design/icons';
import {
  editVisionStaffStatus,
  getVisionStaffList,
  resetVisionStaffPassword,
} from '@/api/prevention/vision';
import { notificationHook, resetPwdHook } from '@/hook/table';
import { AddModal } from './modal/add-modal';

const TableList: React.FC = () => {
  const tableRef = useRef<ActionType>();

  const [addModalInfo, setAddModalInfo] = useState<API.ModalDataType>({
    title: '',
    visible: false,
    currentRow: undefined,
  }); // 创建筛查计划信息

  /**
   * @desc 启用/停用
   */
  const onStatusChange = async (record: VisionColumnsType) => {
    const status = record?.status === 0 ? 1 : 0;
    await editVisionStaffStatus(record?.id, status);
    message.success(`${record?.status ? '启用' : '停用'}成功`);
    tableRef?.current?.reload?.();
  };

  /**
   * @desc 启用/停用
   */
  const onReset = (record: VisionColumnsType) => {
    resetPwdHook({ id: record?.id }, resetVisionStaffPassword, false, (data = []) => {
      const schoolIndex = data.findIndex((item: { systemCode: number }) => item.systemCode === 2);
      const screenIndex = data.findIndex((item: { systemCode: number }) => item.systemCode === 3);
      notificationHook({
        message: '重置密码成功！',
        description: (
          <>
            <p style={{ marginTop: 10 }}>学校管理后台</p>
            <p>{`账号：${data?.[schoolIndex]?.username}，密码：${data?.[schoolIndex]?.password}`}</p>
            <p style={{ marginTop: 10 }}>筛查APP</p>
            <p>{`账号：${data?.[screenIndex]?.username}，密码：${data?.[screenIndex]?.password}`}</p>
          </>
        ),
        duration: 15,
      });
    });
  };

  /**
   * @desc 启用/停用
   */
  const onHandle = (row?: VisionColumnsType) => {
    setAddModalInfo({
      visible: true,
      title: row ? '编辑视力小队' : '创建视力小队',
      currentRow: row,
    });
  };

  const onCancel = (refresh?: boolean) => {
    setAddModalInfo({ visible: false });
    refresh && tableRef?.current?.reload?.();
  };

  const columns: ProColumns<VisionColumnsType>[] = [
    ...listColumns,
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 200,
      render: (_, record) => {
        return [
          <Button key="student" type="link" onClick={() => onHandle(record)}>
            编辑
          </Button>,
          <Button key="recovery" type="link" onClick={() => onStatusChange(record)}>
            {record?.status ? '启用' : '停用'}
          </Button>,
          <Button key="reset" type="link" onClick={() => onReset(record)}>
            重置密码
          </Button>,
        ];
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<VisionColumnsType, API.PageParams>
        rowKey="idCard"
        search={false}
        pagination={{ pageSize: 10 }}
        options={false}
        actionRef={tableRef}
        columnEmptyText={EMPTY}
        toolBarRender={() => [
          <Button type="primary" icon={<PlusOutlined />} onClick={() => onHandle()}>
            创建
          </Button>,
        ]}
        request={async (params) => {
          const { data } = await getVisionStaffList({
            current: params.current,
            size: params.pageSize,
          });
          console.log;
          return {
            data: data?.records,
            success: true,
            total: data?.total,
          };
        }}
        columns={columns}
        scroll={{
          x: '100vw',
        }}
        columnsStateMap={{
          staffName: {
            fixed: 'left',
          },
          option: {
            fixed: 'right',
          },
        }}
      />
      <AddModal {...addModalInfo} onCancel={(refresh) => onCancel(refresh)} />
    </PageContainer>
  );
};

export default TableList;
