import { KeyValueList } from '@/components/data/KeyValueList'
import { Meter } from '@/components/data/Meter'
import { Mono, Value } from '@/components/data/Mono'
import { Panel, PanelBody, PanelHeader } from '@/components/layout/Panel'
import type { Server } from '@/mock/types'
import { gb } from './specs'

/** 사용률이 없는 서버(꺼져 있거나 배포 전)는 막대 대신 —를 둔다 */
function UsageRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-[12px] grid grid-cols-[120px_1fr_44px] items-center gap-[16px] border-t pt-[12px] text-sm">
      <span className="text-ink-mute">{label}</span>
      {value > 0 ? (
        <>
          <Meter value={value} />
          <Value value={value} unit="%" className="text-right" />
        </>
      ) : (
        <span className="col-span-2 text-ink-mute">—</span>
      )}
    </div>
  )
}

export function HardwareTab({ server: s }: { server: Server }) {
  const drives = s.storage
  const cell = 'py-[8px] text-sm'
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-[16px] lg:grid-cols-2">
      {s.gpu && (
        <Panel>
          <PanelHeader title="GPU" />
          <PanelBody>
            <KeyValueList
              items={[
                { label: 'Model', value: <Mono>{`${s.gpu.vendor} ${s.gpu.model}`}</Mono> },
                { label: 'Memory / GPU', value: <Mono>{`${s.gpu.memoryGB} GB ${s.gpu.memoryType}`}</Mono> },
                { label: 'Total VRAM', value: <Mono>{gb(s.gpu.count * s.gpu.memoryGB)}</Mono> },
                { label: 'Interconnect', value: <Mono>{s.gpu.interconnect}</Mono> },
                { label: 'Driver', value: <Mono>{s.gpu.driver}</Mono> },
              ]}
            />
          </PanelBody>
        </Panel>
      )}

      <Panel>
        <PanelHeader title="CPU & Memory" />
        <PanelBody>
          <KeyValueList
            items={[
              { label: 'CPU', value: <Mono>{`${s.cpu.vendor} ${s.cpu.model}`}</Mono> },
              { label: 'Sockets', value: <Mono>{s.cpu.sockets}</Mono> },
              { label: 'Cores', value: <Mono>{`${s.cores} (${s.cpu.coresPerSocket} × ${s.cpu.sockets})`}</Mono> },
              { label: 'Memory', value: <Mono>{gb(s.memoryGB)}</Mono> },
            ]}
          />
          <UsageRow label="Memory usage" value={s.usage.memory} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader title="Storage" />
        <PanelBody>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-ink-mute">
                <th className="pb-[8px] font-medium">Type</th>
                <th className="pb-[8px] font-medium">Size</th>
                <th className="pb-[8px] text-right font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {drives.map((d) => (
                <tr key={d.kind + d.sizeTB} className="border-t">
                  <td className={cell}>
                    <Mono>{d.kind}</Mono>
                  </td>
                  <td className={cell}>
                    <Mono>{d.sizeTB} TB</Mono>
                  </td>
                  <td className={`${cell} text-right`}>
                    <Mono>{d.count}</Mono>
                  </td>
                </tr>
              ))}
              <tr className="border-t font-medium">
                <td className={cell}>Total</td>
                <td className={cell} />
                <td className={`${cell} text-right`}>
                  <Mono>{s.storageTB} TB</Mono>
                </td>
              </tr>
            </tbody>
          </table>
          <UsageRow label="Storage usage" value={s.usage.storage} />
        </PanelBody>
      </Panel>
    </div>
  )
}
